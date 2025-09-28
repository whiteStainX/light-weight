import React from 'react';
import './Stepper.css';

const Stepper = ({ label, value, onChange, step = 1, min = -Infinity, max = Infinity }) => {
  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-controls">
        <button onClick={handleDecrement} className="stepper-button">-</button>
        <span className="stepper-value">{value.toFixed(1)}</span>
        <button onClick={handleIncrement} className="stepper-button">+</button>
      </div>
    </div>
  );
};

export default Stepper;
