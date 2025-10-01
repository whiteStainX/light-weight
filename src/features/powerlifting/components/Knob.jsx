import React from 'react';
import './Knob.css';

const Knob = ({ label, value, onChange, min, max, step, unit }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = -135 + (percentage / 100) * 270;

  const handleInput = (event) => {
    const nextValue = Number(event.target.value);
    onChange(nextValue);
  };

  return (
    <div className="knob-container" role="group" aria-label={label}>
      <div className="knob-header">
        <span className="knob-label">{label}</span>
        {unit ? <span className="knob-unit">{unit}</span> : null}
      </div>
      <div className="knob-face">
        <div className="knob">
          <div className="knob-dial" style={{ transform: `rotate(${rotation}deg)` }} />
        </div>
        <div className="knob-readout">{value.toFixed(3)}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleInput}
        className="knob-slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
};

export default Knob;