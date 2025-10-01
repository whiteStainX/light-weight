import React from 'react';
import Stepper from './Stepper';
import SetupParameters from './SetupParameters';

const VintageControlPanel = ({
  lifts,
  selectedLift,
  onSelectLift,
  definitions,
  values, // This is now the full nested state object
  onSetupParameterChange,
  onResetSetupParameters,
}) => {

  const sharedDefinitions = definitions.shared ?? [];
  const simulationDefinitions = definitions.Simulation ?? [];
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
          values={values.shared} // Pass the correct slice of state
          onParameterChange={(param, value) => onSetupParameterChange('shared', param, value)}
        />
      </div>

      <div className="panel-group">
        <h3 className="panel-title">Technique Parameters</h3>
        <SetupParameters
          definitions={liftSpecificDefinitions}
          values={values[selectedLift]} // Pass the correct slice of state
          onParameterChange={(param, value) => onSetupParameterChange(selectedLift, param, value)}
        />
        <button onClick={() => onResetSetupParameters(selectedLift)} className="font-mono text-sm text-center w-full mt-2">
          Reset to Default
        </button>
      </div>

      <div className="panel-group">
        <h3 className="panel-title">Simulation</h3>
        <div className="flex justify-around">
          <SetupParameters
            definitions={simulationDefinitions}
            values={values.Simulation} // Pass the correct slice of state
            onParameterChange={(param, value) => onSetupParameterChange('Simulation', param, value)}
          />
        </div>
      </div>


    </div>
  );
};

export default VintageControlPanel;