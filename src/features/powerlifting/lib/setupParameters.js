export const DEFAULT_SETUP_PARAMETERS = {
  shared: {
    bodyMass: 75,
    externalLoad: 100,
    stanceWidth: 'Medium',
  },
  Simulation: {
    gravity: 9.81,
    integrationTimestep: 0.01,
    solverTolerance: 1e-5,
  },
  Squat: {
    barHeight: 155,
    barXOffset: 0,
    squatDepth: 45,
  },
  Bench: {
    shoulderAngleStart: 40,
    shoulderAngleEnd: 85,
  },
  Deadlift: {
    hipHeightStart: 55,
    barPullHeight: 22.5,
  },
};

export const PARAMETER_DEFINITIONS = {
  shared: [
    { id: 'bodyMass', name: 'Body Mass', type: 'number', unit: 'kg', min: 40, max: 200, step: 1 },
    { id: 'externalLoad', name: 'External Load', type: 'number', unit: 'kg', min: 20, max: 500, step: 1 },
    { id: 'stanceWidth', name: 'Stance Width', type: 'select', options: ['Narrow', 'Medium', 'Wide'] },
  ],
  Simulation: [
    { id: 'gravity', name: 'Gravity', type: 'knob', unit: 'm/s²', min: 1, max: 20, step: 0.1 },
    { id: 'integrationTimestep', name: 'Timestep', type: 'knob', unit: 's', min: 0.001, max: 0.1, step: 0.001 },
    { id: 'solverTolerance', name: 'Tolerance', type: 'knob', unit: '', min: 1e-6, max: 1e-3, step: 1e-6 },
  ],
  Squat: [
    { id: 'barHeight', name: 'Bar Height', type: 'number', unit: 'cm', min: 130, max: 180, step: 1 },
    { id: 'barXOffset', name: 'Bar Horiz. Offset', type: 'number', unit: 'cm', min: -5, max: 5, step: 0.5 },
    { id: 'squatDepth', name: 'Squat Depth', type: 'number', unit: 'cm', min: 30, max: 60, step: 1 },
  ],
  Bench: [
    { id: 'shoulderAngleStart', name: 'Shoulder Angle (Top)', type: 'number', unit: '°', min: 30, max: 90, step: 1 },
    { id: 'shoulderAngleEnd', name: 'Shoulder Angle (Bottom)', type: 'number', unit: '°', min: 80, max: 120, step: 1 },
  ],
  Deadlift: [
    { id: 'hipHeightStart', name: 'Hip Height (Start)', type: 'number', unit: 'cm', min: 40, max: 80, step: 1 },
    { id: 'barPullHeight', name: 'Bar Pull Height', type: 'number', unit: 'cm', min: 20, max: 25, step: 0.5 },
  ],
};

export const createDefaultSetupState = (lifts = []) => {
  const state = {}
  lifts.forEach((lift) => {
    state[lift] = { ...(DEFAULT_SETUP_PARAMETERS[lift] ?? {}) }
  })
  return state
}

