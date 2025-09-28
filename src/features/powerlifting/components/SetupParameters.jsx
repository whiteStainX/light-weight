const toDisplayValue = (value, step = 1) => {
  if (!Number.isFinite(value)) return '—'
  if (step >= 1) {
    return Math.round(value)
  }
  if (step >= 0.5) {
    return value.toFixed(1)
  }
  return value.toFixed(2)
}

const SetupParameters = ({
  lift,
  definitions = [],
  values = {},
  defaults = {},
  onChange,
  onReset,
}) => {
  if (!definitions.length) {
    return null
  }

  return (
    <section className="flex flex-col gap-3 rounded border border-black/40 bg-white p-3 text-[10px] text-[#0c0c0c] shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]">
      <header className="flex items-center justify-between">
        <div>
          <p className="uppercase tracking-[0.3em] text-black/70">Setup parameters</p>
          <p className="text-[9px] text-black/60">Fine-tune the {lift?.toLowerCase()} starting geometry.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded border border-black/40 px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-[#0c0c0c] transition-colors hover:border-black"
        >
          Reset
        </button>
      </header>

      <div className="grid gap-2">
        {definitions.map(({ key, label, description, unit = '', min = 0, max = 1, step = 1 }) => {
          const current = Number(values?.[key] ?? defaults?.[key] ?? min)
          return (
            <label key={key} className="space-y-1">
              <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.25em] text-black/70">
                <span>{label}</span>
                <span className="text-[#0c0c0c]">
                  {toDisplayValue(current, step)} {unit}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={current}
                onChange={(event) => onChange?.(key, Number(event.target.value))}
                className="w-full accent-black"
              />
              {description && <p className="text-[9px] leading-snug text-black/60">{description}</p>}
            </label>
          )
        })}
      </div>
    </section>
  )
}

export default SetupParameters

