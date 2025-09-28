# light-weight
a react project to illustrate the big 3 power lifting in a scientific way

## Features

*   **Refactored Animation Logic:** The animation system has been re-architected for improved biomechanical accuracy and maintainability. The animation solver now directly outputs joint angle changes, which are then processed by a dedicated kinematics engine.
*   **Vintage Mac OS UI:** Complete redesign of the application's interface with a classic Mac OS System 7 aesthetic, featuring distinct windows and high-contrast elements.
*   **Modular Control Panel:** A new `VintageControlPanel` component provides a compact and consistent interface for all lift parameters, playback controls, and tuning adjustments.
*   **Compact Stepper Controls:** Replaced traditional sliders and knobs with tactile `Stepper` components for precise adjustments.
*   **Enhanced Coach's Cue:** The Coach's Cue section now displays random, motivating quotes from Pavel Tsatsouline, accompanied by a vintage ASCII art icon.
*   **Refactored Application Logic:** The main `App.jsx` component has been significantly cleaned up by extracting business logic into a `usePowerlifting` custom hook and moving static content into a dedicated `content.js` file.

## Folder Structure

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