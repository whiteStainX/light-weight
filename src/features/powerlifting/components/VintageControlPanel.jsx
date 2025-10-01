import React from 'react';
import SetupParameters from './SetupParameters';

import './VintageControlPanel.css';

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
      <div className="vintage-control-panel__scroll">
        <section className="panel-group">
          <header className="panel-title">Lift Selection</header>
          <div className="panel-button-grid">
            {lifts.map((lift) => (
              <button
                key={lift}
                type="button"
                onClick={() => onSelectLift(lift)}
                className={`panel-button ${selectedLift === lift ? 'panel-button--active' : ''}`}
              >
                {lift}
              </button>
            ))}
          </div>
        </section>

        <section className="panel-group">
          <header className="panel-title">Subject &amp; Load</header>
          <SetupParameters
            definitions={sharedDefinitions}
            values={values.shared} // Pass the correct slice of state
            onParameterChange={(param, value) => onSetupParameterChange('shared', param, value)}
          />
        </section>

        <section className="panel-group">
          <header className="panel-title">Technique Parameters</header>
          <SetupParameters
            definitions={liftSpecificDefinitions}
            values={values[selectedLift]} // Pass the correct slice of state
            onParameterChange={(param, value) => onSetupParameterChange(selectedLift, param, value)}
          />
          <div className="panel-footer">
            <button
              type="button"
              onClick={() => onResetSetupParameters(selectedLift)}
              className="panel-button panel-button--ghost"
            >
              Reset to Default
            </button>
          </div>
        </section>

        <section className="panel-group">
          <header className="panel-title">Simulation</header>
          <SetupParameters
            definitions={simulationDefinitions}
            values={values.Simulation} // Pass the correct slice of state
            onParameterChange={(param, value) => onSetupParameterChange('Simulation', param, value)}
          />
        </section>
      </div>
    </div>
  );
};

export default VintageControlPanel;