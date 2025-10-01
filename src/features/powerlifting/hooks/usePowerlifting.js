import { useState, useMemo, useEffect } from 'react';
import { useLiftAnimation } from './useLiftAnimation';
import { useKinematics } from './useKinematics';
import { liftData } from '../lib/liftData.js';
import { DEFAULT_SETUP_PARAMETERS, createDefaultSetupState } from '../lib/setupParameters';

export const usePowerlifting = () => {
  const LIFT_OPTIONS = Object.keys(liftData);
  const [selectedLift, setSelectedLift] = useState(LIFT_OPTIONS[0]);

  const [manualOffsets, setManualOffsets] = useState({});
  const [manualBarOffset, setManualBarOffset] = useState({ x: 0, y: 0 });
  const [setupParameters, setSetupParameters] = useState(() => ({ ...DEFAULT_SETUP_PARAMETERS.shared, ...DEFAULT_SETUP_PARAMETERS[LIFT_OPTIONS[0]], }));

  const handleSelectLift = (lift) => {
    setSelectedLift(lift);
    setSetupParameters(prev => ({
      ...DEFAULT_SETUP_PARAMETERS.shared,
      ...DEFAULT_SETUP_PARAMETERS[lift],
    }));
  };

  const activeParameters = setupParameters[selectedLift] ?? DEFAULT_SETUP_PARAMETERS[selectedLift] ?? {};

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

  const handleSetupParameterChange = (parameter, value) => {
    setSetupParameters((current) => ({
      ...current,
      [selectedLift]: {
        ...(current[selectedLift] ?? DEFAULT_SETUP_PARAMETERS[selectedLift] ?? {}),
        [parameter]: value,
      },
    }));
  };

  const handleResetSetupParameters = () => {
    setSetupParameters((current) => ({
      ...current,
      [selectedLift]: { ...(DEFAULT_SETUP_PARAMETERS[selectedLift] ?? {}) },
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
    setSelectedLift: handleSelectLift,
    activeParameters,
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
