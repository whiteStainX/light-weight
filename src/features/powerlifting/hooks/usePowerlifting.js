import { useState, useMemo } from 'react';
import { useLiftAnimation } from './useLiftAnimation';
import { useKinematics } from './useKinematics';
import { liftData } from '../lib/liftData.js';
import { DEFAULT_SETUP_PARAMETERS } from '../lib/setupParameters';

export const usePowerlifting = () => {
  const LIFT_OPTIONS = Object.keys(liftData);
  const [selectedLift, setSelectedLift] = useState(LIFT_OPTIONS[0]);

  // The state now mirrors the nested structure of the defaults
  const [setupParameters, setSetupParameters] = useState(DEFAULT_SETUP_PARAMETERS);

  const [manualOffsets, setManualOffsets] = useState({});
  const [manualBarOffset, setManualBarOffset] = useState({ x: 0, y: 0 });

  // This combines the shared, simulation, and active lift parameters for the animation
  const activeParameters = useMemo(() => ({
    ...setupParameters.shared,
    ...setupParameters.Simulation,
    ...(setupParameters[selectedLift] ?? {}),
  }), [setupParameters, selectedLift]);

  const { joints: animatedAngleOffsets, barOffset: animatedBarPosition, isPlaying, togglePlay, tempo, setTempo, progress, phase } =
    useLiftAnimation({ liftType: selectedLift, parameters: activeParameters });

  const handleAngleOffsetChange = (joint, value) => {
    setManualOffsets((current) => ({ ...current, [joint]: value }));
  };

  const handleResetAdjustments = () => {
    setManualOffsets({});
    setManualBarOffset({ x: 0, y: 0 });
  };

  const handleBarOffsetChange = (next) => {
    setManualBarOffset((current) => ({ ...current, ...next }));
  };

  // This function now correctly updates the nested state
  const handleSetupParameterChange = (group, parameter, value) => {
    setSetupParameters(current => ({
      ...current,
      [group]: {
        ...current[group],
        [parameter]: value,
      },
    }));
  };

  // This function now correctly resets a group
  const handleResetSetupParameters = (group) => {
    setSetupParameters(current => ({
      ...current,
      [group]: DEFAULT_SETUP_PARAMETERS[group],
    }));
  };

  const kinematics = useKinematics({
    liftType: selectedLift,
    manualAngleOffsets: manualOffsets,
    animatedAngleOffsets,
    animatedBarPosition,
    manualBarOffset,
  });

  return {
    LIFT_OPTIONS,
    selectedLift,
    setSelectedLift,
    setupParameters, // Export the full nested state
    activeParameters, // Export the combined parameters for the animation
    kinematics,
    animation: {
      isPlaying,
      togglePlay,
      tempo,
      setTempo,
      progress,
      phase,
    },
    controls: {
      manualOffsets,
      handleAngleOffsetChange,
      handleResetAdjustments,
      manualBarOffset,
      handleBarOffsetChange,
      handleSetupParameterChange,
      handleResetSetupParameters,
    },
  };
};