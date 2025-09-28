import { useEffect, useMemo, useState } from 'react'

import MainLayout from './components/layout/MainLayout'
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

  const layoutControls = (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-black/70">
      <span className="rounded border border-black/60 bg-black/80 px-2 py-[2px] text-white">{selectedLift}</span>
      <span className="hidden md:inline">kinematic study in progress</span>
    </div>
  )

  const coachNotes = (
    <div className="space-y-2">
      <header className="space-y-1">
        <div className="h-[2px] w-14 bg-black" />
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-black/70">Coach&apos;s log</h2>
      </header>
      <ul className="grid gap-1 text-[11px] text-black/75">
        <li>Keep the bar stacked over the mid-foot in every view.</li>
        <li>Drive through stable feet or shoulders—the contact points never wander.</li>
        <li>Reset your brace between reps; torque cues flare when tension drops.</li>
      </ul>
    </div>
  )

  return (
    <MainLayout cue={cue} controls={layoutControls} sidebar={coachNotes}>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.45fr),minmax(0,1fr)]">
        <div className="min-h-0">
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
        </div>
        <div className="min-h-0 flex flex-col gap-3">
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
        </div>
      </div>
    </MainLayout>
  )
}

export default App
