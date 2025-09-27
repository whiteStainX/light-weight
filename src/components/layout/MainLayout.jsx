const MainLayout = ({ children, cue, controls, sidebar }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="space-y-6 border-b border-zinc-800 pb-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Light Weight Baby</p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">
              Precision strength illustration suite
            </h1>
            <p className="max-w-3xl text-sm text-zinc-400">
              {cue}
            </p>
          </div>
          {controls && <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">{controls}</div>}
        </header>

        <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <main className="space-y-6">{children}</main>
          {sidebar && <aside className="lg:sticky lg:top-10">{sidebar}</aside>}
        </div>

        <footer className="border-t border-zinc-800 pt-4 text-[11px] uppercase tracking-[0.3em] text-zinc-600">
          Strength is a skill—practice with intent, comrade.
        </footer>
      </div>
    </div>
  )
}

export default MainLayout
