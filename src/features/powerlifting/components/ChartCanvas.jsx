import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ChartCanvas = ({ title }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/v1/simulate/placeholder', {
          method: 'POST', // As defined in the plan
        });
        const result = await response.json();

        // Recharts expects an array of objects, so we need to transform the data
        const transformedData = result.series.time.map((t, i) => ({
          time: t.toFixed(2),
          hip_angle: result.series.hip_angle[i],
          knee_angle: result.series.knee_angle[i],
          hip_moment: result.series.hip_moment[i],
          knee_moment: result.series.knee_moment[i],
        }));

        setData(transformedData);
      } catch (error) {
        console.error("Failed to fetch simulation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center font-mono">
        Loading Simulation Data...
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid stroke="#000000" strokeOpacity={0.3} strokeDasharray="3 3" />
          <XAxis 
            dataKey="time"
            stroke="#000000"
            tick={{ fontFamily: 'monospace', fontSize: 12 }}
            label={{ value: 'Time (s)', position: 'insideBottom', dy: 10, fontFamily: 'monospace', fontSize: 12 }}
          />
          <YAxis 
            stroke="#000000"
            tick={{ fontFamily: 'monospace', fontSize: 12 }}
            label={{ value: 'Angle (°)', angle: -90, position: 'insideLeft', dx: -10, fontFamily: 'monospace', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #000000', fontFamily: 'monospace' }}
            labelStyle={{ fontFamily: 'monospace' }}
          />
          <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: 12 }} />
          <Line type="monotone" dataKey="hip_angle" stroke="#000000" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="knee_angle" stroke="#000000" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCanvas;