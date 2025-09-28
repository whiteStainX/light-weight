const MainLayout = ({ children, cue, controls, sidebar }) => {
  return (
    <div className="h-dvh w-full overflow-hidden bg-[#f7f7f2] text-[#161616]">
      <div className="mx-auto grid h-full max-w-5xl grid-rows-[auto,1fr,auto] gap-3 px-3 py-3">
        <header className="flex items-center justify-between rounded border border-black/20 bg-white px-4 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,0.12)]">
          <div className="space-y-1 text-black">
            <p className="text-[10px] uppercase tracking-[0.4em] text-black/70">Light Weight Baby</p>
            <h1 className="text-xl font-semibold tracking-[0.08em]">Biomechanics Console</h1>
            <p className="max-w-xl text-[11px] leading-snug text-black/70">{cue}</p>
          </div>
          {controls && <div className="shrink-0 text-[10px] uppercase tracking-[0.3em] text-black/60">{controls}</div>}
        </header>

        <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1.55fr),minmax(0,1fr)]">
          <main className="flex min-h-0 flex-col gap-3 overflow-hidden">{children}</main>
          {sidebar && <aside className="min-h-0 overflow-hidden">{sidebar}</aside>}
        </div>

        <footer className="rounded border border-black/20 bg-white px-4 py-2 text-[9px] uppercase tracking-[0.35em] text-black/60 shadow-[4px_4px_0_0_rgba(0,0,0,0.12)]">
          Strength is a skill—practice with intent, comrade.
        </footer>
      </div>
    </div>
  )
}

export default MainLayout
