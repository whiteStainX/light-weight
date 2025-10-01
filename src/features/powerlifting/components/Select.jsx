import React from 'react';
import './Select.css';

const Select = ({ label, value, options, onChange }) => {
  return (
    <label className="panel-select">
      <span className="panel-select__label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="panel-select__field"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Select;
