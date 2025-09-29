export const DEFAULT_SETUP_PARAMETERS = {
  Squat: {
    kneeTravel: 10,
    hipSetback: 22,
    barGap: 2,
  },
  Bench: {
    gripSpan: 55,
    barTravel: 40,
    shoulderSet: 20,
  },
  Deadlift: {
    hipSetback: 24,
    shoulderOffset: 6,
    startClearance: 5,
    barTravel: 45,
  },
}

export const PARAMETER_DEFINITIONS = {
  Squat: [
    {
      key: 'kneeTravel',
      label: 'Knee travel',
      unit: 'cm',
      min: 6,
      max: 14,
      step: 0.5,
      description: 'How far the knees glide forward at the top; scales the depth sweep.',
    },
    {
      key: 'hipSetback',
      label: 'Hip set-back',
      unit: 'cm',
      min: 18,
      max: 28,
      step: 0.5,
      description: 'Horizontal distance from bar to hips at setup.',
    },
    {
      key: 'barGap',
      label: 'Bar-to-shoulder gap',
      unit: 'cm',
      min: 1,
      max: 4,
      step: 0.25,
      description: 'Keeps the bar resting on the shoulders without drifting forward.',
    },
  ],
  Bench: [
    {
      key: 'gripSpan',
      label: 'Grip span',
      unit: 'cm',
      min: 45,
      max: 65,
      step: 0.5,
      description: 'Width between hands at lockout—narrower for closer grips, wider for power styles.',
    },
    {
      key: 'barTravel',
      label: 'Bar travel',
      unit: 'cm',
      min: 18,
      max: 26,
      step: 0.5,
      description: 'Distance from chest touch to lockout, approximating arch depth.',
    },
    {
      key: 'shoulderSet',
      label: 'Shoulder set',
      unit: 'cm',
      min: 16,
      max: 24,
      step: 0.5,
      description: 'How far the shoulders retract beneath the bar during setup.',
    },
  ],
  Deadlift: [
    {
      key: 'hipSetback',
      label: 'Hip set-back',
      unit: 'cm',
      min: 20,
      max: 28,
      step: 0.5,
      description: 'Horizontal distance hips sit behind the barbell before the pull.',
    },
    {
      key: 'shoulderOffset',
      label: 'Shoulder offset',
      unit: 'cm',
      min: 2,
      max: 10,
      step: 0.5,
      description: 'How far shoulders start in front of the bar to keep lats loaded.',
    },
    {
      key: 'startClearance',
      label: 'Start clearance',
      unit: 'cm',
      min: 4,
      max: 8,
      step: 0.25,
      description: 'Bar height off the platform (plate diameter or deficit variations).',
    },
    {
      key: 'barTravel',
      label: 'Bar travel',
      unit: 'cm',
      min: 40,
      max: 55,
      step: 0.5,
      description: 'Total bar displacement from floor to lockout.',
    },
  ],
}

export const createDefaultSetupState = (lifts = []) => {
  const state = {}
  lifts.forEach((lift) => {
    state[lift] = { ...(DEFAULT_SETUP_PARAMETERS[lift] ?? {}) }
  })
  return state
}

