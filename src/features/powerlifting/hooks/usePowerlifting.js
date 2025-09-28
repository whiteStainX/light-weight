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
  const [setupParameters, setSetupParameters] = useState(() => createDefaultSetupState(LIFT_OPTIONS));

  useEffect(() => {
    setManualOffsets({});
    setManualBarOffset({ x: 0, y: 0 });
  }, [selectedLift]);

  const activeParameters = setupParameters[selectedLift] ?? DEFAULT_SETUP_PARAMETERS[selectedLift] ?? {};

  const { joints: animatedOffsets, barOffset: animatedBarOffset, isPlaying, togglePlay, tempo, setTempo, progress, phase } =
    useLiftAnimation({ liftType: selectedLift, parameters: activeParameters });

  const combinedOverrides = useMemo(() => {
    const overrides = {};
    const jointKeys = new Set([...Object.keys(animatedOffsets ?? {}), ...Object.keys(manualOffsets ?? {})]);
    jointKeys.forEach((joint) => {
      const totalDegrees = (animatedOffsets?.[joint] ?? 0) + (manualOffsets?.[joint] ?? 0);
      overrides[joint] = { angleOffset: (totalDegrees * Math.PI) / 180 };
    });

    const totalBarOffset = {
      x: (animatedBarOffset?.x ?? 0) + (manualBarOffset?.x ?? 0),
      y: (animatedBarOffset?.y ?? 0) + (manualBarOffset?.y ?? 0),
    };

    return {
      ...overrides,
      bar: { offset: totalBarOffset },
    };
  }, [animatedBarOffset, animatedOffsets, manualBarOffset, manualOffsets]);

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
    jointOverrides: combinedOverrides,
  });

  return {
    LIFT_OPTIONS,
    selectedLift,
    setSelectedLift,
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
