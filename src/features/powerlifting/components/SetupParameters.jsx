import Knob from './Knob';

const SetupParameters = ({ lift, definitions = [], values = {}, defaults = {}, onChange, onReset }) => {
  if (!definitions.length) {
    return null;
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

      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        {definitions.map(({ key, label, min = 0, max = 1, step = 1 }) => {
          const current = Number(values?.[key] ?? defaults?.[key] ?? min);
          return (
            <Knob
              key={key}
              label={label}
              value={current}
              onChange={(value) => onChange?.(key, value)}
              min={min}
              max={max}
              step={step}
            />
          );
        })}
      </div>
    </section>
  );
};

export default SetupParameters;

