# Design Documentation

This document tracks the design discussion and decisions for the light-weight project. It now preserves the original stick-figure animation concept for historical context and documents the transition to the charts-first redesign.

## Transition to Charts-First Redesign

Multiple contributors attempted to dial in the hand-built animation loop and sync the biomechanical numbers, but the approach never reached an accurate, repeatable state. To unblock the broader redesign, we are pivoting toward a data-driven experience centered on synchronized charts. The new product direction is captured in `_temp/redesign_global_context.md`, which serves as the implementation playbook for the refactor toward static datasets, shared cursors, and coach-style insights.

### Goals for the Redesign

* Replace the hand-tuned animation with Highcharts- or ECharts-powered time-series panels that render precomputed biomechanics for each lift scenario.
* Preserve the vintage System 7 interface while expanding the control modules to include scenario selection, compare mode, and an insights panel.
* Introduce lightweight hooks (`useDatasets`, `useSyncCursor`, `useInsights`) that coordinate data loading, cross-chart interaction, and contextual cues.

The remaining sections capture the prior animation-focused design so that historical decisions and context remain accessible during the transition.

## Core Purpose

1.  **Interactive Animation:** Create a clean, interactive, animated illustration of the three main powerlifting exercises: Squat, Bench Press, and Deadlift.
2.  **Biomechanical Insight:** Illustrate joint movement, bar movement, and display calculated torque values. The goal is to help athletes understand optimal technique.
3.  **Reference Material:** The principles are influenced by Pavel Tsatsouline's books, "Power to the People" and "Beyond Bodybuilding."

## Technical Implementation

1.  **Kinematics:** Use fixed limb segment lengths with simple inverse kinematics, aligned with the initial hand sketches. This will ensure realistic bar and joint motion.
2.  **Views:** The application will feature both side and front views for each lift.
    *   **Squat/Deadlift:** Standard side and front perspectives.
    *   **Bench Press:** Side view and a front view from the spotter's perspective.
3.  **Data Display:** Key metrics, such as torque, will be displayed numerically alongside the animation.
4.  **User Configuration:** Users will be able to adjust certain parameters to see how they affect the movement and metrics.

### Animation Logic Refactor

**Problem:**
Initially, the animation system suffered from an architectural inconsistency. The `useLiftAnimation` hook's solver functions (`solveSquat`, `solveBench`, `solveDeadlift`) directly calculated absolute joint positions. These positions were then used to *derive* joint angle offsets, which were subsequently fed into `useKinematics.js` to perform *forward kinematics* and re-calculate joint positions. This created a redundant and inverted kinematic chain, making the system overly complex, harder to debug, and less flexible for future biomechanical enhancements.

Furthermore, the dynamic calculation of `sceneBounds` within `AnimationCanvas.jsx` based on the current joint positions caused the animation viewport to zoom and shift during playback, leading to a jarring user experience.

**Solution:**
To streamline the architecture and improve biomechanical accuracy, the animation logic was refactored as follows:

1.  **Decoupled Kinematic Chain:**
    *   `useLiftAnimation.js` was refactored to make its `solver` functions (`solveSquat`, `solveBench`, `solveDeadlift`) directly output *joint angle offsets* (in radians) and the *bar position* based on the animation `progress`.
    *   `useKinematics.js` was made solely responsible for performing *forward kinematics*. It now takes these animated angle offsets and bar position, combines them with any manual overrides, and calculates the final absolute joint positions and bar position.
    *   This ensures a clear, unidirectional kinematic flow: Animation (angles) -> Kinematics (positions) -> Rendering.

2.  **Static Scene Bounds:**
    *   To prevent the animation viewport from zooming and shifting, static `sceneBounds` were pre-defined for each lift type in `liftData.js`.
    *   `useKinematics.js` was updated to use these static `sceneBounds` if available, ensuring a consistent and stable viewport throughout the animation.
    *   The redundant `computeSceneBounds` function was removed from `AnimationCanvas.jsx`, which now directly consumes the static `sceneBounds` prop.

**Key Bug Fixes During Refactor:**

*   **Variable Destructuring Mismatch:** A `ReferenceError` occurred in `usePowerlifting.js` because the destructuring of the `useLiftAnimation` hook's return value used incorrect variable names (`angleOffsets` and `barPosition` instead of `joints` and `barOffset`). This resulted in `animatedAngleOffsets` and `animatedBarPosition` being `undefined`, causing the animation to appear static. This was resolved by correcting the destructuring assignment.
*   **Unit and Structure Mismatch for Manual Overrides:** The manual joint angle adjustments from the UI (`manualOffsets` in degrees) were not being correctly applied. `useKinematics.js` expected a different data structure (`{ jointName: { angleOffset: radians } }`) and unit (radians) than what was being passed (`{ jointName: degrees }`). This was fixed by:
    *   Renaming the prop in `useKinematics.js` to `manualAngleOffsets` for clarity.
    *   Modifying `useKinematics.js` to directly access the degree value from `manualAngleOffsets[joint]`.
    *   Converting the manual degree offset to radians before adding it to the animated radian offset.
    *   Adjusting `usePowerlifting.js` to pass `manualOffsets` directly as `manualAngleOffsets`.

### Lift-Specific Kinematics Refinements

**Bench Press:**
*   **Problem:** The stick figure was static, and the grip did not match the bar's position. This was due to the bar not being explicitly anchored to the `grip` joint in `liftData.js`.
*   **Solution:** Corrected the J-curve implementation in `solveBench` by reversing the horizontal bar path to move towards the feet on descent, matching biomechanical diagrams. Increased the default `barTravel` parameter in `setupParameters.js` to provide a more realistic vertical range of motion. Refined the elbow tuck logic by adjusting the start and end angles for the shoulder-elbow segment, creating a more natural movement.

**Deadlift:**
*   **Problem:** The bar visually cut through the legs, and there was a potential architectural mismatch in how the bar's position was determined when anchored.
*   **Solution:** Adjusted the horizontal `BAR_X` position in `solveDeadlift` (within `useLiftAnimation.js`) to place the bar slightly in front of the legs, improving biomechanical accuracy and preventing visual overlap. The `solveDeadlift` function was further refined to adopt a squat-like kinematic approach for horizontal joint positioning. This involves defining dynamic horizontal offsets for the knee, hip, and shoulder relative to the fixed `BAR_X` throughout the lift. This ensures the bar path remains consistently vertical relative to the body, addressing the perception of horizontal bar movement. The `useKinematics.js` logic for bar positioning was made more robust: if an anchor is defined, the bar's position is derived from the anchored joint's position plus any manual offset; otherwise, it uses the animated bar position. This ensures correct bar-grip synchronization and consistent behavior across lifts.

### Data Flow Architecture

The application's data flow is designed to be unidirectional, ensuring a clear and predictable state management process. The `usePowerlifting` hook acts as the central controller, orchestrating the flow of data between user inputs, animation logic, and the final kinematic calculations.

```
[ VintageControlPanel (UI) ]
        |
        | (User Events: e.g., onSelectLift, onTempoChange)
        v
+---------------------------------+
|      usePowerlifting.js         |
|---------------------------------|
| - Manages all application state |
|   (selectedLift, parameters,    |
|    manualOffsets, etc.)         |
| - Contains all event handlers   |
|                                 |-----> [ useLiftAnimation.js ]
+---------------------------------+       | (Receives liftType, params)
        |                                 |
        | (Passes down props)             | - Calculates animatedAngleOffsets
        v                                 | - Calculates animatedBarPosition
+---------------------------------+       |
|        useKinematics.js         | <-----| (Returns animation data)
|---------------------------------|
| - Receives animated data and    |
|   manual overrides              |
| - Resolves skeleton from        |
|   liftData.js                   |
| - Computes final joint          |
|   positions (Forward Kinematics)|
+---------------------------------+
        |
        | (Returns final kinematics: joints, barPosition, etc.)
        v
[ AnimationCanvas.jsx (Rendering) ]
        |
        v
[ StickFigure.jsx (SVG) ]
```

### Folder Structure

```
src/
├── features/
│   └── powerlifting/
│       ├── components/
│       │   ├── AnimationCanvas.jsx  // Renders the main SVG animation
│       │   ├── ControlModule.jsx    // Reusable component for bordered sections
│       │   ├── Stepper.jsx          // Compact +/- value adjuster
│       │   ├── StickFigure.jsx      // The animated stick-figure component
│       │   └── VintageControlPanel.jsx // The main control panel with vintage UI
│       ├── hooks/
│       │   ├── useKinematics.js     // Logic for calculating joint positions/torques
│       │   └── usePowerlifting.js   // Custom hook encapsulating app logic
│       └── lib/
│           ├── content.js           // Static content like quotes and ASCII art
│           ├── liftData.js
│           └── setupParameters.js
├── components/
│   ├── effects/
│   │   └── Typewriter.jsx         // Component for typing text effect
│   └── layout/
│       ├── MainLayout.jsx         // Main application layout
│       └── VintageWindow.jsx      // Component for vintage window frames
└── App.jsx                        // Main app component, now a clean layout container
```
