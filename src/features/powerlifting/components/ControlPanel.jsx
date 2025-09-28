const ControlPanel = ({
  lifts,
  selectedLift,
  onSelectLift,
  torque,
  angles,
  manualOffsets,
  onAngleOffsetChange,
  onResetAngles,
  onBarOffsetChange,
  barOffset,
  isPlaying,
  onTogglePlay,
  tempo,
  onTempoChange,
  phaseLabel,
}) => {
  const torqueEntries = torque ? Object.entries(torque.perJoint) : []
  const angleEntries = angles ? Object.entries(angles) : []

  return (
    <div className="flex h-full flex-col gap-4 rounded border border-black/20 bg-white p-4 text-[11px] text-black shadow-[4px_4px_0_0_rgba(0,0,0,0.12)]">
      <section className="space-y-2">
        <header className="flex items-center justify-between">
          <div>
            <p className="uppercase tracking-[0.3em] text-black/60">Playback</p>
            <p className="text-[10px] text-black/50">{phaseLabel ?? 'Continuous cycle'}</p>
          </div>
          <button
            type="button"
            onClick={onTogglePlay}
            className="rounded border border-black bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </header>
        <label className="grid gap-1 text-[10px] uppercase tracking-[0.2em] text-black/60">
          Tempo
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={Number(tempo)}
            onChange={(event) => onTempoChange(Number(event.target.value))}
            className="w-full accent-black"
          />
        </label>
        <p className="text-[10px] text-black/60">Cadence {tempo.toFixed(2)}× base cycle.</p>
      </section>

      <section className="space-y-2">
        <p className="uppercase tracking-[0.3em] text-black/60">Select lift</p>
        <div className="flex flex-wrap gap-1">
          {lifts.map((lift) => (
            <button
              key={lift}
              type="button"
              onClick={() => onSelectLift(lift)}
              className={`rounded border px-2 py-1 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                lift === selectedLift ? 'border-black bg-black text-white' : 'border-black/30 bg-white text-black hover:border-black'
              }`}
            >
              {lift}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-black/50">Toggle the discipline to swap the torque map.</p>
      </section>

      <section className="space-y-2">
        <header className="flex items-center justify-between">
          <div>
            <p className="uppercase tracking-[0.3em] text-black/60">Joint tuning</p>
            <p className="text-[10px] text-black/50">Offsets layer on top of the animated cycle.</p>
          </div>
          <button
            type="button"
            onClick={onResetAngles}
            className="rounded border border-black/40 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-black transition-colors hover:border-black"
          >
            Reset
          </button>
        </header>
        <div className="grid gap-2">
          {angleEntries.map(([joint, { absolute }]) => (
            <div key={joint} className="space-y-1">
              <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.2em] text-black/60">
                <span>{joint}</span>
                <span className="text-black">{absolute.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                step={1}
                value={Number(manualOffsets?.[joint] ?? 0)}
                onChange={(event) => onAngleOffsetChange(joint, Number(event.target.value))}
                className="w-full accent-black"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="uppercase tracking-[0.3em] text-black/60">Bar path</p>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <label className="space-y-1">
            <span className="block uppercase tracking-[0.2em] text-black/60">Horizontal</span>
            <input
              type="range"
              min={-60}
              max={60}
              step={1}
              value={Math.round(barOffset?.x ?? 0)}
              onChange={(event) => onBarOffsetChange({ x: Number(event.target.value) })}
              className="w-full accent-black"
            />
          </label>
          <label className="space-y-1">
            <span className="block uppercase tracking-[0.2em] text-black/60">Vertical</span>
            <input
              type="range"
              min={-60}
              max={60}
              step={1}
              value={Math.round(barOffset?.y ?? 0)}
              onChange={(event) => onBarOffsetChange({ y: Number(event.target.value) })}
              className="w-full accent-black"
            />
          </label>
        </div>
        <p className="text-[10px] text-black/50">
          Offset x:{Math.round(barOffset?.x ?? 0)}px · y:{Math.round(barOffset?.y ?? 0)}px
        </p>
      </section>

      <section className="space-y-1">
        <header>
          <p className="uppercase tracking-[0.3em] text-black/60">Torque snapshot</p>
          <p className="text-[10px] text-black/50">Positive values = bar anterior to joint.</p>
        </header>
        <ul className="space-y-1">
          {torqueEntries.map(([joint, value]) => (
            <li key={joint} className="flex items-center justify-between border-b border-black/10 pb-1 last:border-b-0 last:pb-0">
              <span className="uppercase tracking-[0.2em] text-black/60">{joint}</span>
              <span className="font-semibold text-black">{value.toFixed(2)} Nm</span>
            </li>
          ))}
          {!torqueEntries.length && <li className="text-black/40">No torque data available.</li>}
        </ul>
      </section>
    </div>
  )
}

export default ControlPanel
