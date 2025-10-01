import React from 'react';

const Select = ({ label, value, options, onChange }) => {
  return (
    <div className="flex items-center justify-between font-mono text-sm">
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border-2 border-black p-1 w-28 text-right"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
