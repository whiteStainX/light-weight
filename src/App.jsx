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

  const { joints, limbs, barPosition, torque, root, rootPosition, angles, surfaces } = useKinematics({

    liftType: selectedLift,
    jointOverrides: combinedOverrides,
  })

  const layoutControls = (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-black/70">
      <span className="rounded border border-black/30 bg-white px-2 py-1 text-black">{selectedLift}</span>
      <span className="hidden md:inline text-black/50">kinematic study in progress</span>
    </div>
  )

  return (
    <MainLayout
      cue={cue}
      controls={layoutControls}
      sidebar={
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
      }
    >
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
      />
      <section className="rounded border border-black/20 bg-white px-4 py-3 text-xs leading-relaxed text-black/70 shadow-[4px_4px_0_0_rgba(0,0,0,0.12)]">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.35em] text-black/60">Coach&apos;s log</h2>
        <ul className="grid gap-1 text-[11px]">
          <li>Align the bar over the mid-foot at all times; torque arrows will flare when it drifts.</li>
          <li>Keep the highlighted joints stacked vertically before initiating concentric drive.</li>
          <li>Re-breathe and brace whenever the annotations prompt a reset in the cycle.</li>
        </ul>
      </section>
    </MainLayout>
  )
}

export default App
