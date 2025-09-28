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
    <div className="flex h-full min-h-0 flex-col gap-3 rounded border border-black/40 bg-white p-3 text-[10px] text-[#0c0c0c] shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]">
      <section className="space-y-1">
        <header className="flex items-center justify-between">
          <div>
            <p className="uppercase tracking-[0.3em] text-black/70">Playback</p>
            <p className="text-[9px] text-black/60">{phaseLabel ?? 'Continuous cycle'}</p>
          </div>
          <button
            type="button"
            onClick={onTogglePlay}
            className="rounded border border-black bg-black px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </header>
        <label className="grid gap-1 uppercase tracking-[0.2em] text-black/70">
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
        <p className="text-[9px] text-black/60">Cadence {tempo.toFixed(2)}× base.</p>
      </section>

      <section className="space-y-1">
        <p className="uppercase tracking-[0.3em] text-black/70">Select lift</p>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {lifts.map((lift) => (
            <button
              key={lift}
              type="button"
              onClick={() => onSelectLift(lift)}
              className={`rounded border px-2 py-1 text-[9px] uppercase tracking-[0.2em] transition-colors ${
                lift === selectedLift
                  ? 'border-black bg-black text-white'
                  : 'border-black/30 bg-white text-[#0c0c0c] hover:border-black hover:bg-black/10'
              }`}
            >
              {lift}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-1">
        <header className="flex items-center justify-between">
          <p className="uppercase tracking-[0.3em] text-black/70">Joint tuning</p>
          <button
            type="button"
            onClick={onResetAngles}
            className="rounded border border-black/40 px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-[#0c0c0c] transition-colors hover:border-black"
          >
            Reset
          </button>
        </header>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {angleEntries.map(([joint, { absolute }]) => (
            <div key={joint} className="space-y-1">
              <div className="flex items-baseline justify-between uppercase tracking-[0.2em] text-black/70">
                <span>{joint}</span>
                <span className="text-[#0c0c0c]">{absolute.toFixed(1)}°</span>
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

      <section className="space-y-1">
        <p className="uppercase tracking-[0.3em] text-black/70">Bar path</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="block uppercase tracking-[0.2em] text-black/70">Horizontal</span>
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
            <span className="block uppercase tracking-[0.2em] text-black/70">Vertical</span>
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
        <p className="text-[9px] text-black/60">
          Offset x:{Math.round(barOffset?.x ?? 0)}px · y:{Math.round(barOffset?.y ?? 0)}px
        </p>
      </section>

      <section className="space-y-1">
        <p className="uppercase tracking-[0.3em] text-black/70">Torque snapshot</p>
        <ul className="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-2">
          {torqueEntries.map(([joint, value]) => (
            <li
              key={joint}
              className="flex items-center justify-between border-b border-black/20 pb-1 last:border-b-0 last:pb-0"
            >
              <span className="uppercase tracking-[0.2em] text-black/70">{joint}</span>
              <span className="font-semibold text-[#0c0c0c]">{value.toFixed(2)} Nm</span>
            </li>
          ))}
          {!torqueEntries.length && <li className="text-black/30">No torque data.</li>}
        </ul>
      </section>
    </div>
  )
}

export default ControlPanel
