# Design Documentation

This document tracks the design discussion and decisions for the light-weight project.

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
*   **Solution:** Added an explicit bar anchor to the `grip` joint in `liftData.Bench`. The `solveBench` function in `useLiftAnimation.js` was refined to ensure the `grip` joint's position directly corresponds to the bar's position, allowing `useKinematics` to correctly derive the bar's movement from the anchored joint.

**Deadlift:**
*   **Problem:** The bar visually cut through the legs, and there was a potential architectural mismatch in how the bar's position was determined when anchored.
*   **Solution:** Adjusted the horizontal `BAR_X` position in `solveDeadlift` (within `useLiftAnimation.js`) to place the bar slightly in front of the legs, improving biomechanical accuracy and preventing visual overlap. The `solveDeadlift` function was further refined to adopt a squat-like kinematic approach for horizontal joint positioning. This involves defining dynamic horizontal offsets for the knee, hip, and shoulder relative to the fixed `BAR_X` throughout the lift. This ensures the bar path remains consistently vertical relative to the body, addressing the perception of horizontal bar movement. The `useKinematics.js` logic for bar positioning was made more robust: if an anchor is defined, the bar's position is derived from the anchored joint's position plus any manual offset; otherwise, it uses the animated bar position. This ensures correct bar-grip synchronization and consistent behavior across lifts.

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
