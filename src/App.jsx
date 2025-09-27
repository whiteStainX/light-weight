import { useEffect, useMemo, useState } from 'react'

import MainLayout from './components/layout/MainLayout'
import AnimationCanvas from './features/powerlifting/components/AnimationCanvas'
import ControlPanel from './features/powerlifting/components/ControlPanel'
import { useKinematics } from './features/powerlifting/hooks/useKinematics'
import { useLiftAnimation } from './features/powerlifting/hooks/useLiftAnimation'

import { liftData } from './features/powerlifting/lib/liftData.js'

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

  useEffect(() => {
    setManualOffsets({})
    setManualBarOffset({ x: 0, y: 0 })
  }, [selectedLift])

  const { joints: animatedOffsets, barOffset: animatedBarOffset, isPlaying, togglePlay, tempo, setTempo, progress, phase } =
    useLiftAnimation({ liftType: selectedLift })

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

  const { joints, limbs, barPosition, torque, root, rootPosition, angles, surfaces, frontProfile } = useKinematics({
    liftType: selectedLift,
    jointOverrides: combinedOverrides,
  })


  const layoutControls = (
    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
      <span className="text-zinc-300">Active lift →</span>
      <span className="rounded-sm border border-zinc-700 px-3 py-1 text-zinc-100">{selectedLift}</span>
      <span className="hidden md:inline text-zinc-500">Both views synced to current kinematics.</span>
    </div>
  )

  return (
    <MainLayout cue={cue} controls={layoutControls} sidebar={
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
    }>
      <div className="grid gap-6 lg:grid-cols-2">
        <AnimationCanvas
          title={`${selectedLift} mechanics`}
          joints={joints}
          limbs={limbs}
          barPosition={barPosition}
          variant="side"
          rootPosition={rootPosition ?? joints?.[root]}
          torque={torque}
          progress={progress}
          phase={phase}
          surfaces={surfaces}
          angles={angles}
          frontProfile={frontProfile}
        />
        <AnimationCanvas
          title={`${selectedLift} structure`}
          joints={joints}
          limbs={limbs}
          barPosition={barPosition}
          variant="front"
          rootPosition={rootPosition ?? joints?.[root]}
          torque={torque}
          progress={progress}
          phase={phase}
          surfaces={surfaces}
          angles={angles}
          frontProfile={frontProfile}
        />
      </div>
      <section className="rounded-md border border-zinc-800 bg-zinc-900/50 p-6 text-sm leading-relaxed text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <h2 className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">Coach&apos;s cue</h2>
        <p>
          Hold power in reserve until the moment of truth. Maintain the wedge, drive with intent, and remember:
          strength is patience under load. Light weight, baby—because discipline makes it so.
        </p>
      </section>
    </MainLayout>
  )
}

export default App
