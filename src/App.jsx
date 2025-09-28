import { useEffect, useMemo, useState } from 'react'

import MainLayout from './components/layout/MainLayout'
import VintageWindow from './components/layout/VintageWindow'
import AnimationCanvas from './features/powerlifting/components/AnimationCanvas'
import ControlPanel from './features/powerlifting/components/ControlPanel'
import SetupParameters from './features/powerlifting/components/SetupParameters'
import { useKinematics } from './features/powerlifting/hooks/useKinematics'
import { useLiftAnimation } from './features/powerlifting/hooks/useLiftAnimation'

import { liftData } from './features/powerlifting/lib/liftData.js'
import {
  DEFAULT_SETUP_PARAMETERS,
  PARAMETER_DEFINITIONS,
  createDefaultSetupState,
} from './features/powerlifting/lib/setupParameters'

const LIFT_OPTIONS = Object.keys(liftData)

const App = () => {
  const [selectedLift, setSelectedLift] = useState(LIFT_OPTIONS[0])
  const cue = useMemo(
    () =>
      `Comrade, breathe deep and crush the handle. The ${selectedLift.toLowerCase()} rewards tension, timing, and ruthless focus.`,
    [selectedLift],
  )

  const [manualOffsets, setManualOffsets] = useState({})
  const [manualBarOffset, setManualBarOffset] = useState({ x: 0, y: 0 })
  const [setupParameters, setSetupParameters] = useState(() => createDefaultSetupState(LIFT_OPTIONS))

  useEffect(() => {
    setManualOffsets({})
    setManualBarOffset({ x: 0, y: 0 })
  }, [selectedLift])

  const activeParameters = setupParameters[selectedLift] ?? DEFAULT_SETUP_PARAMETERS[selectedLift] ?? {}

  const { joints: animatedOffsets, barOffset: animatedBarOffset, isPlaying, togglePlay, tempo, setTempo, progress, phase } =
    useLiftAnimation({ liftType: selectedLift, parameters: activeParameters })

  const combinedOverrides = useMemo(() => {
    const overrides = {}
    const jointKeys = new Set([...Object.keys(animatedOffsets ?? {}), ...Object.keys(manualOffsets ?? {})])
    jointKeys.forEach((joint) => {
      const totalDegrees = (animatedOffsets?.[joint] ?? 0) + (manualOffsets?.[joint] ?? 0)
      overrides[joint] = { angleOffset: (totalDegrees * Math.PI) / 180 }
    })

    const totalBarOffset = {
      x: (animatedBarOffset?.x ?? 0) + (manualBarOffset?.x ?? 0),
      y: (animatedBarOffset?.y ?? 0) + (manualBarOffset?.y ?? 0),
    }

    return {
      ...overrides,
      bar: { offset: totalBarOffset },
    }
  }, [animatedBarOffset, animatedOffsets, manualBarOffset, manualOffsets])

  const handleAngleOffsetChange = (joint, value) => {
    setManualOffsets((current) => ({
      ...current,
      [joint]: value,
    }))
  }

  const handleResetAdjustments = () => {
    setManualOffsets({})
    setManualBarOffset({ x: 0, y: 0 })
  }

  const handleBarOffsetChange = (next) => {
    setManualBarOffset((current) => ({ ...current, ...next }))
  }

  const handleSetupParameterChange = (parameter, value) => {
    setSetupParameters((current) => ({
      ...current,
      [selectedLift]: {
        ...(current[selectedLift] ?? DEFAULT_SETUP_PARAMETERS[selectedLift] ?? {}),
        [parameter]: value,
      },
    }))
  }

  const handleResetSetupParameters = () => {
    setSetupParameters((current) => ({
      ...current,
      [selectedLift]: { ...(DEFAULT_SETUP_PARAMETERS[selectedLift] ?? {}) },
    }))
  }

  const { joints, limbs, barPosition, torque, root, rootPosition, angles, surfaces, sceneBounds } = useKinematics({
    liftType: selectedLift,
    jointOverrides: combinedOverrides,
  })

  const parameterDefinitions = PARAMETER_DEFINITIONS[selectedLift] ?? []

  return (
    <MainLayout>
      <div className="flex flex-1 min-h-0 gap-4">
        <VintageWindow title="Animation" className="w-3/5">
          <AnimationCanvas
            title={`${selectedLift} torque study`}
            joints={joints}
            limbs={limbs}
            barPosition={barPosition}
            rootPosition={rootPosition ?? joints?.[root]}
            torque={torque}
            progress={progress}
            phase={phase}
            surfaces={surfaces}
            angles={angles}
            sceneBounds={sceneBounds}
          />
        </VintageWindow>
        <VintageWindow title="Controls" className="w-2/5 flex flex-col gap-4">
          <SetupParameters
            lift={selectedLift}
            definitions={parameterDefinitions}
            values={activeParameters}
            defaults={DEFAULT_SETUP_PARAMETERS[selectedLift] ?? {}}
            onChange={handleSetupParameterChange}
            onReset={handleResetSetupParameters}
          />
          <ControlPanel
            lifts={LIFT_OPTIONS}
            selectedLift={selectedLift}
            onSelectLift={setSelectedLift}
            torque={torque}
            angles={angles}
            manualOffsets={manualOffsets}
            onAngleOffsetChange={handleAngleOffsetChange}
            onResetAngles={handleResetAdjustments}
            onBarOffsetChange={handleBarOffsetChange}
            barOffset={manualBarOffset}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            tempo={tempo}
            onTempoChange={setTempo}
            phaseLabel={phase}
          />
        </VintageWindow>
      </div>
    </MainLayout>
  )
}

export default App
