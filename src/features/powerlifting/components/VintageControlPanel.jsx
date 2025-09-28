import React from 'react';
import './VintageControlPanel.css';
import ControlModule from './ControlModule';
import Stepper from './Stepper';

const VintageControlPanel = ({
  lifts,
  selectedLift,
  onSelectLift,
  definitions,
  values,
  defaults,
  onSetupParameterChange,
  onResetSetupParameters,
  isPlaying,
  onTogglePlay,
  tempo,
  onTempoChange,
  angles,
  manualOffsets,
  onAngleOffsetChange,
  onResetAngles,
  barOffset,
  onBarOffsetChange,
}) => {
  const angleEntries = angles ? Object.entries(angles) : [];

  return (
    <div className="vintage-control-panel">
      <ControlModule title="Select Lift">
        <div className="lift-selector">
          {lifts.map((lift) => (
            <button
              key={lift}
              onClick={() => onSelectLift(lift)}
              className={`lift-button ${lift === selectedLift ? 'active' : ''}`}>
              {lift}
            </button>
          ))}
        </div>
      </ControlModule>

      <ControlModule title="Setup Parameters">
        <div className="grid grid-cols-2 gap-2">
          {definitions.map(({ key, label, min, max, step }) => (
            <Stepper
              key={key}
              label={label}
              value={Number(values?.[key] ?? defaults?.[key] ?? min)}
              onChange={(value) => onSetupParameterChange?.(key, value)}
              min={min}
              max={max}
              step={step}
            />
          ))}
        </div>
      </ControlModule>

      <ControlModule title="Playback">
        <div className="flex items-center gap-4">
          <button onClick={onTogglePlay} className="playback-button">
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
              className="w-full vintage-slider"
            />
          </div>
        </div>
      </ControlModule>

      <ControlModule title="Fine Tuning">
        <div className="grid grid-cols-1 gap-1">
          {angleEntries.map(([joint]) => (
            <Stepper
              key={`tune-${joint}`}
              label={joint}
              value={manualOffsets?.[joint] ?? 0}
              onChange={(value) => onAngleOffsetChange(joint, value)}
              min={-45}
              max={45}
              step={1}
            />
          ))}
          <Stepper
            label="Bar Horz."
            value={barOffset?.x ?? 0}
            onChange={(value) => onBarOffsetChange({ x: value })}
            min={-60}
            max={60}
            step={1}
          />
          <Stepper
            label="Bar Vert."
            value={barOffset?.y ?? 0}
            onChange={(value) => onBarOffsetChange({ y: value })}
            min={-60}
            max={60}
            step={1}
          />
        </div>
      </ControlModule>
    </div>
  );
};

export default VintageControlPanel;
