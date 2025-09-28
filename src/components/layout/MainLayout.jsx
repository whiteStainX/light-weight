const MainLayout = ({ children, cue, controls, sidebar }) => {
  return (
    <div className="h-dvh w-full overflow-hidden bg-[#e5e5e5] text-[#0c0c0c]">
      <div className="mx-auto flex h-full max-w-5xl flex-col gap-3 px-4 py-4">
        <header className="rounded border border-black/40 bg-white px-4 py-4 shadow-[2px_2px_0_0_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.35em] text-black/60">Light Weight Baby</p>
              <h1 className="text-xl font-semibold tracking-[0.08em] text-black">Biomechanics Console</h1>
              <p className="max-w-xl text-[11px] leading-snug text-black/75">{cue}</p>
            </div>
            {controls && (
              <div className="shrink-0 rounded border border-black/30 bg-[#f5f5f5] px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-black/70">
                {controls}
              </div>
            )}
          </div>
        </header>

        {sidebar && (
          <section className="rounded border border-black/40 bg-white px-4 py-3 text-[11px] leading-relaxed text-black shadow-[2px_2px_0_0_rgba(0,0,0,0.35)]">
            {sidebar}
          </section>
        )}

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>

        <footer className="rounded border border-black/40 bg-white px-4 py-2 text-[9px] uppercase tracking-[0.3em] text-black/70 shadow-[2px_2px_0_0_rgba(0,0,0,0.45)]">
          Strength is a skill—practice with intent, comrade.
        </footer>
      </div>
    </div>
  )
}

export default MainLayout
