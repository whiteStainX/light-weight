import React from 'react';
import { Handle, Position } from 'reactflow';
import VintageWindow from '../layout/VintageWindow';
import SetupParameters from '../../features/powerlifting/components/SetupParameters';

const ParameterNode = ({ data }) => {
  const { title, definitions, values, onParameterChange, onReset } = data;

  return (
    <VintageWindow title={title || 'Parameters'} className="w-80">
      <Handle type="source" position={Position.Right} />
      <div className="p-2 space-y-2">
        <SetupParameters
          definitions={definitions}
          values={values}
          onParameterChange={onParameterChange}
        />
        <button onClick={onReset} className="font-mono text-sm text-center w-full mt-2">
          Reset
        </button>
      </div>
    </VintageWindow>
  );
};

export default ParameterNode;
