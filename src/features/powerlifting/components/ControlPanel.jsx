const ControlPanel = ({
  lifts,
  selectedLift,
  onSelectLift,
  torque,
  angles,
  onAngleOffsetChange,
  onResetAngles,
  onBarOffsetChange,
  barOffset,
}) => {
  const torqueEntries = torque ? Object.entries(torque.perJoint) : []
  const angleEntries = angles ? Object.entries(angles) : []

  return (
    <div className="flex h-full flex-col gap-6 rounded-md border border-zinc-700/80 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Select lift</p>
        <div className="flex flex-wrap gap-2">
          {lifts.map((lift) => (
            <button
              key={lift}
              type="button"
              onClick={() => onSelectLift(lift)}
              className={`rounded-sm border px-3 py-2 text-sm tracking-wide transition-colors ${
                lift === selectedLift
                  ? 'border-zinc-50 bg-zinc-50 text-zinc-900'
                  : 'border-zinc-700/70 bg-zinc-950 text-zinc-100 hover:border-zinc-500'
              }`}
            >
              {lift}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-zinc-400">
          Comrade, choose your discipline and study the mechanics before loading the bar.
        </p>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Joint tuning</p>
            <p className="text-[11px] text-zinc-400">Adjust offsets to explore different positions.</p>
          </div>
          <button
            type="button"
            onClick={onResetAngles}
            className="rounded-sm border border-zinc-600 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-zinc-200 hover:border-zinc-400"
          >
            Reset
          </button>
        </header>
        <div className="space-y-3">
          {angleEntries.map(([joint, { offset, absolute }]) => (
            <div key={joint} className="space-y-1">
              <div className="flex items-baseline justify-between text-xs uppercase tracking-[0.2em] text-zinc-400">
                <span>{joint}</span>
                <span className="text-zinc-300">{absolute.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min={-45}
                max={45}
                step={1}
                value={Number(offset)}
                onChange={(event) => onAngleOffsetChange(joint, Number(event.target.value))}
                className="w-full accent-zinc-50"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Bar path</p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
          <label className="space-y-1">
            <span className="block uppercase tracking-[0.2em] text-zinc-500">Horizontal</span>
            <input
              type="range"
              min={-60}
              max={60}
              step={1}
              value={Math.round(barOffset?.x ?? 0)}
              onChange={(event) => onBarOffsetChange({ x: Number(event.target.value) })}
              className="w-full accent-zinc-50"
            />
          </label>
          <label className="space-y-1">
            <span className="block uppercase tracking-[0.2em] text-zinc-500">Vertical</span>
            <input
              type="range"
              min={-60}
              max={60}
              step={1}
              value={Math.round(barOffset?.y ?? 0)}
              onChange={(event) => onBarOffsetChange({ y: Number(event.target.value) })}
              className="w-full accent-zinc-50"
            />
          </label>
        </div>
        <p className="text-[11px] text-zinc-500">
          Offset → x: {Math.round(barOffset?.x ?? 0)}px, y: {Math.round(barOffset?.y ?? 0)}px
        </p>
      </section>

      <section className="space-y-2">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Torque snapshot</p>
          <p className="text-[11px] text-zinc-400">Positive values mean the bar drifts forward of the joint.</p>
        </header>
        <ul className="space-y-1 text-[11px] text-zinc-300">
          {torqueEntries.map(([joint, value]) => (
            <li key={joint} className="flex items-center justify-between border-b border-white/5 pb-1 last:border-b-0 last:pb-0">
              <span className="uppercase tracking-[0.2em] text-zinc-500">{joint}</span>
              <span className="font-semibold text-zinc-100">{value.toFixed(2)} Nm</span>
            </li>
          ))}
          {!torqueEntries.length && <li className="text-zinc-500">No torque data available.</li>}
        </ul>
      </section>
    </div>
  )
}

export default ControlPanel
