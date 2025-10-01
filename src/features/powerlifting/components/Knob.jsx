import React from 'react';
import './Knob.css';

const Knob = ({ label, value, onChange, min, max, step }) => {
  // This is a simplified implementation for visual effect.
  // A real implementation would use mouse drag events.
  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = -135 + (percentage / 100) * 270;

  return (
    <div className="knob-container font-mono text-sm">
      <div className="knob">
        <div className="knob-dial" style={{ transform: `rotate(${rotation}deg)` }}></div>
      </div>
      <label className="knob-label">{label}</label>
      <div className="knob-value">{value.toFixed(2)}</div>
    </div>
  );
};

export default Knob;