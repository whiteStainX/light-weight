import React from 'react';
import './Stepper.css';

const Stepper = ({ label, value, onChange, step = 1, min = -Infinity, max = Infinity, unit }) => {
  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  return (
    <div className="stepper" role="group" aria-label={label}>
      <div className="stepper-labels">
        <span className="stepper-label">{label}</span>
        {unit ? <span className="stepper-unit">{unit}</span> : null}
      </div>
      <div className="stepper-controls">
        <button type="button" onClick={handleDecrement} className="stepper-button" aria-label={`Decrease ${label}`}>
          −
        </button>
        <span className="stepper-value">{value.toFixed(2)}</span>
        <button type="button" onClick={handleIncrement} className="stepper-button" aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
};

export default Stepper;
