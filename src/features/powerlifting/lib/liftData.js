export const liftData = {
  Squat: {
    path: {
      foot: { x: 210, y: 440 },
      knee: { x: 210, y: 340 },
      hip: { x: 210, y: 250 },
      shoulder: { x: 210, y: 170 },
      bar: { x: 210, y: 160 },
    },
    limbs: [
      { from: 'foot', to: 'knee' },
      { from: 'knee', to: 'hip' },
      { from: 'hip', to: 'shoulder' },
    ],
    anchors: {
      bar: { joint: 'shoulder', offset: { x: 0, y: -10 } },
    },
    surfaces: {
      ground: 440,
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
  },
  Bench: {
    path: {
      shoulder: { x: 200, y: 330 },
      elbow: { x: 280, y: 330 },
      grip: { x: 320, y: 260 },
      bar: { x: 320, y: 250 },
    },
    limbs: [
      { from: 'shoulder', to: 'elbow' },
      { from: 'elbow', to: 'grip' },
    ],
    anchors: {},
    surfaces: {
      benchTop: 350,
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
  },
  Deadlift: {
    path: {
      foot: { x: 220, y: 440 },
      knee: { x: 220, y: 350 },
      hip: { x: 205, y: 260 },
      shoulder: { x: 205, y: 180 },
      grip: { x: 220, y: 290 },
      bar: { x: 220, y: 300 },
    },
    limbs: [
      { from: 'foot', to: 'knee' },
      { from: 'knee', to: 'hip' },
      { from: 'hip', to: 'shoulder' },
      { from: 'shoulder', to: 'grip' },
    ],
    anchors: {
      bar: { joint: 'grip', offset: { x: 0, y: 12 } },
    },
    surfaces: {
      ground: 440,
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
  },
};
