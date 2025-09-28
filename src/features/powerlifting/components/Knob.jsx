import React, { useState, useRef, useEffect } from 'react';
import './Knob.css';

const Knob = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      
      let normalizedAngle = (angle + 450) % 360;
      if (normalizedAngle > 315) normalizedAngle = 0;
      if (normalizedAngle < 225 && normalizedAngle > 180) normalizedAngle = 315;

      const range = max - min;
      let newValue = min + (normalizedAngle / 315) * range;
      newValue = Math.round(newValue / step) * step;
      newValue = Math.max(min, Math.min(max, newValue));

      onChange(newValue);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const rotation = ((value - min) / (max - min)) * 315;

  return (
    <div className="knob-container">
      <div className="knob-label">{label}</div>
      <div className="knob" ref={knobRef} onMouseDown={handleMouseDown}>
        <div className="knob-marker" style={{ transform: `rotate(${rotation}deg)` }}></div>
      </div>
      <div className="knob-value">{value.toFixed(1)}</div>
    </div>
  );
};

export default Knob;
