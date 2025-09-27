export const liftData = {
  Squat: {
    path: {
      shoulder: { x: 200, y: 150 },
      hip: { x: 200, y: 250 },
      knee: { x: 200, y: 350 },
      foot: { x: 200, y: 450 },
      bar: { x: 200, y: 140 },
    },
    limbs: [
      { from: 'hip', to: 'shoulder' },
      { from: 'hip', to: 'knee' },
      { from: 'knee', to: 'foot' },
    ],
  },
  Bench: {
    path: {
      shoulder: { x: 200, y: 350 }, // Shoulder on the bench
      elbow: { x: 300, y: 350 },
      grip: { x: 300, y: 250 },
      bar: { x: 300, y: 240 },
    },
    limbs: [
      { from: 'shoulder', to: 'elbow' },
      { from: 'elbow', to: 'grip' },
    ],
  },
  Deadlift: {
    path: {
      shoulder: { x: 250, y: 250 },
      hip: { x: 200, y: 350 },
      knee: { x: 220, y: 400 },
      foot: { x: 250, y: 450 },
      bar: { x: 250, y: 420 },
    },
    limbs: [
      { from: 'hip', to: 'shoulder' },
      { from: 'hip', to: 'knee' },
      { from: 'knee', to: 'foot' },
    ],
  },
};