import { useMemo, useState } from 'react'
import MainLayout from './components/layout/MainLayout'
import AnimationCanvas from './features/powerlifting/components/AnimationCanvas'
import ControlPanel from './features/powerlifting/components/ControlPanel'
import { useKinematics } from './features/powerlifting/hooks/useKinematics'
import { liftData } from './features/powerlifting/lib/liftData.js'

const LIFT_OPTIONS = Object.keys(liftData)

const App = () => {
  const [selectedLift, setSelectedLift] = useState(LIFT_OPTIONS[0])
  const cue = useMemo(
    () =>
      `Comrade, breathe deep and crush the handle. The ${selectedLift.toLowerCase()} rewards tension, timing, and ruthless focus.`,
    [selectedLift],
  )

  const {
    joints,
    limbs,
    barPosition,
    barOffset,
    torque,
    root,
    rootPosition,
    angles,
    setJointOffset,
    resetAngles,
    setBarOffset,
  } = useKinematics({ liftType: selectedLift })

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
        onAngleOffsetChange={setJointOffset}
        onResetAngles={resetAngles}
        onBarOffsetChange={setBarOffset}
        barOffset={barOffset}
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
        />
        <AnimationCanvas
          title={`${selectedLift} structure`}
          joints={joints}
          limbs={limbs}
          barPosition={barPosition}
          variant="front"
          rootPosition={rootPosition ?? joints?.[root]}
          torque={torque}
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
