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

### Folder Structure

```
src/
├── features/
│   └── powerlifting/
│       ├── components/
│       │   ├── AnimationCanvas.jsx  // Renders the main SVG animation
│       │   ├── ControlPanel.jsx     // Holds sliders and buttons for user input
│       │   └── StickFigure.jsx      // The animated stick-figure component
│       └── hooks/
│           └── useKinematics.js     // Logic for calculating joint positions/torques
├── components/
│   └── layout/
│       └── MainLayout.jsx         // Main application layout
└── App.jsx                        // Main app component that assembles the layout
```
