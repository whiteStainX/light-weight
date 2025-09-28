const MainLayout = ({ children, cue, controls, sidebar }) => {
  return (
    <div className="min-h-screen bg-[#f7f7f2] text-[#161616]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6">
        <header className="rounded border border-black/20 bg-white px-5 py-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.12)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/70">Light Weight Baby</p>
              <h1 className="text-2xl font-semibold tracking-wide text-black">Biomechanics Console</h1>
              <p className="max-w-xl text-xs leading-relaxed text-black/70">{cue}</p>
            </div>
            {controls && (
              <div className="flex flex-col items-end gap-2 text-[11px] uppercase tracking-[0.25em] text-black/60">
                {controls}
              </div>
            )}
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)]">
          <main className="flex flex-col gap-4">{children}</main>
          {sidebar && <aside className="self-start lg:sticky lg:top-6">{sidebar}</aside>}
        </div>

        <footer className="rounded border border-black/20 bg-white px-5 py-3 text-[10px] uppercase tracking-[0.3em] text-black/60 shadow-[4px_4px_0_0_rgba(0,0,0,0.12)]">
          Strength is a skill—practice with intent, comrade.
        </footer>
      </div>
    </div>
  )
}

export default MainLayout
