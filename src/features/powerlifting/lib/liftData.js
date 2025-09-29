export const liftData = {
  Squat: {
    path: {
      foot: { x: 400, y: 500 },
      knee: { x: 440, y: 336.8313755650309 },
      hip: { x: 312, y: 240.8313755650309 },
      shoulder: { x: 408, y: 88.56844507963666 },
      bar: { x: 400, y: 88.56844507963666 },
    },
    limbs: [
      { from: 'foot', to: 'knee' },
      { from: 'knee', to: 'hip' },
      { from: 'hip', to: 'shoulder' },
    ],
    anchors: {
      bar: { joint: 'shoulder', offset: { x: -8, y: 0 } },
    },
    surfaces: {
      ground: 500,
    },
    frontProfile: {
      fallbackWidth: 48,
      widths: {
        foot: { base: 72, min: 68, max: 78 },
        knee: { base: 58, driver: 'knee', scale: 0.7, min: 58, max: 112 },
        hip: { base: 44, driver: 'hip', scale: 0.55, min: 44, max: 92 },
        shoulder: { base: 38, driver: 'shoulder', scale: 0.35, min: 34, max: 68 },
        bar: { follow: 'shoulder' },
      },
      crossLinks: ['hip', 'shoulder'],
    },
    sceneBounds: {
      minX: 150,
      maxX: 650,
      minY: 0,
      maxY: 550,
    },
    limbLengths: {
      shin: 42,
      thigh: 40,
      torso: 45,
    },
  },
  Bench: {
    path: {
      shoulder: { x: 320, y: 340 },
      elbow: { x: 290, y: 460 },
      grip: { x: 290, y: 348 },
      bar: { x: 400, y: 348 },
    },
    limbs: [
      { from: 'shoulder', to: 'elbow' },
      { from: 'elbow', to: 'grip' },
    ],
    anchors: {
      bar: { joint: 'grip', offset: { x: 0, y: 0 } },
    },    surfaces: {
      benchTop: 360,
      benchHeight: 36,
    },
    frontProfile: {
      fallbackWidth: 52,
      widths: {
        shoulder: { base: 64, min: 60, max: 70 },
        elbow: { base: 74, driver: 'elbow', scale: 0.25, min: 70, max: 88 },
        grip: { base: 82, driver: 'elbow', scale: 0.32, min: 78, max: 96 },
        bar: { follow: 'grip', offset: 4, min: 80, max: 100 },
      },
      crossLinks: ['shoulder'],
    },
    sceneBounds: {
      minX: 100,
      maxX: 700,
      minY: 0,
      maxY: 500,
    },
    limbLengths: {
      forearm: 28,
      humerus: 30,
    },
    basePositions: {
      cy: 320,
      barBaseY: 320 + 7, // cy + cmToPx(7)
    },
  },
  Deadlift: {
    path: {
      foot: { x: 400, y: 500 },
      knee: { x: 408, y: 332.1905842927757 },
      hip: { x: 304, y: 335.19454626338427 },
      shoulder: { x: 424, y: 201.03046761339687 },
      grip: { x: 400, y: 480 },
      bar: { x: 400, y: 480 },
    },
    limbs: [
      { from: 'foot', to: 'knee' },
      { from: 'knee', to: 'hip' },
      { from: 'hip', to: 'shoulder' },
      { from: 'shoulder', to: 'grip' },
    ],
    anchors: {
      bar: { joint: 'grip', offset: { x: 0, y: 0 } },
    },
    surfaces: {
      ground: 500,
    },
    frontProfile: {
      fallbackWidth: 46,
      widths: {
        foot: { base: 66, min: 60, max: 74 },
        knee: { base: 54, driver: 'knee', scale: 0.45, min: 52, max: 86 },
        hip: { base: 40, driver: 'hip', scale: 0.5, min: 38, max: 80 },
        shoulder: { base: 36, driver: 'shoulder', scale: 0.45, min: 34, max: 68 },
        grip: { base: 58, driver: 'grip', scale: 0.4, min: 54, max: 92 },
        bar: { follow: 'grip', offset: 4, min: 60, max: 96 },
      },
      crossLinks: ['hip', 'shoulder'],
    },
    sceneBounds: {
      minX: 150,
      maxX: 650,
      minY: 0,
      maxY: 550,
    },
    limbLengths: {
      shin: 42,
      thigh: 40,
      torso: 45,
      arm: 70,
    },
    basePositions: {
      barX: 410,
    },
  },
};
