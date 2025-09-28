const ControlPanel = ({ lifts, selectedLift, onSelectLift, isPlaying, onTogglePlay, tempo, onTempoChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <section>
        <p className="uppercase tracking-widest text-xs mb-2">Select Lift</p>
        <div className="flex gap-2">
          {lifts.map((lift) => (
            <button
              key={lift}
              type="button"
              onClick={() => onSelectLift(lift)}
              className={`flex-1 py-2 text-xs uppercase tracking-widest border border-black transition-colors ${
                lift === selectedLift
                  ? 'bg-black text-white'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              {lift}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="uppercase tracking-widest text-xs mb-2">Playback</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex-1 py-2 text-xs uppercase tracking-widest border border-black bg-gray-300 hover:bg-gray-400"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <div className="flex-1">
            <label className="block uppercase tracking-widest text-xs mb-1">Tempo</label>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.05}
              value={Number(tempo)}
              onChange={(event) => onTempoChange(Number(event.target.value))}
              className="w-full accent-black"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default ControlPanel
