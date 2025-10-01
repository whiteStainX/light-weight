import React from 'react';
import Stepper from './Stepper';
import Select from './Select';
import Knob from './Knob';

const SetupParameters = ({ definitions, values, onParameterChange }) => {
  return (
    <div className="space-y-2">
      {definitions.map(def => {
        if (def.type === 'number') {
          return (
            <Stepper
              key={def.id}
              label={def.name}
              value={values[def.id]}
              min={def.min}
              max={def.max}
              step={def.step}
              unit={def.unit}
              onChange={(value) => onParameterChange(def.id, value)}
            />
          );
        } else if (def.type === 'select') {
          return (
            <Select
              key={def.id}
              label={def.name}
              value={values[def.id]}
              options={def.options}
              onChange={(value) => onParameterChange(def.id, value)}
            />
          );
        } else if (def.type === 'knob') {
          return (
            <Knob
              key={def.id}
              label={def.name}
              value={values[def.id]}
              min={def.min}
              max={def.max}
              step={def.step}
              onChange={(value) => onParameterChange(def.id, value)}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default SetupParameters;

