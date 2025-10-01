import React from 'react';
import Stepper from './Stepper';
import SetupParameters from './SetupParameters';
import Select from './Select'; // Import the new Select component

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
}) => {

  const sharedDefinitions = definitions.shared ?? [];
  const liftSpecificDefinitions = definitions[selectedLift] ?? [];

  return (
    <div className="vintage-control-panel">
      <div className="panel-group">
        <h3 className="panel-title">Lift Selection</h3>
        <div className="grid grid-cols-3 gap-1">
          {lifts.map(lift => (
            <button
              key={lift}
              onClick={() => onSelectLift(lift)}
              className={`font-mono text-sm border-2 border-black px-2 py-1 ${selectedLift === lift ? 'bg-black text-white' : 'bg-white text-black'}`}>
              {lift}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-group">
        <h3 className="panel-title">Subject & Load</h3>
        <SetupParameters
          definitions={sharedDefinitions}
          values={values}
          defaults={defaults.shared ?? {}}
          onParameterChange={onSetupParameterChange}
        />
      </div>

      <div className="panel-group">
        <h3 className="panel-title">Technique Parameters</h3>
        <SetupParameters
          definitions={liftSpecificDefinitions}
          values={values}
          defaults={defaults[selectedLift] ?? {}}
          onParameterChange={onSetupParameterChange}
        />
        <button onClick={onResetSetupParameters} className="font-mono text-sm text-center w-full mt-2">
          Reset to Default
        </button>
      </div>

      <div className="panel-group">
        <h3 className="panel-title">Playback</h3>
        <div className="flex items-center justify-between">
          <button onClick={onTogglePlay} className="font-mono text-lg border-2 border-black px-4 py-1 w-32">
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <Stepper label="Tempo" value={tempo} min={0.1} max={2.0} step={0.1} onChange={onTempoChange} />
        </div>
      </div>
    </div>
  );
};

export default VintageControlPanel;
