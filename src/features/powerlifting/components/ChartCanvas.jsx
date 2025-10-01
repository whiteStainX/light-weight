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

const MiniChart = ({ data, title, dataKeys }) => (
  <div className="w-1/2 h-1/2 p-2">
    <h4 className="font-mono text-sm text-center">{title}</h4>
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid stroke="#000000" strokeOpacity={0.2} strokeDasharray="3 3" />
        <XAxis dataKey="time" hide={true} />
        <YAxis stroke="#000000" tick={{ fontFamily: 'monospace', fontSize: 10 }} />
        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #000000', fontFamily: 'monospace', fontSize: 12 }} />
        {dataKeys.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} stroke="#000000" strokeWidth={2} dot={false} strokeDasharray={i % 2 === 1 ? "3 3" : ""} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const ChartCanvas = ({ title }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/v1/simulate/placeholder', {
          method: 'POST',
        });
        const result = await response.json();
        const transformedData = result.series.time.map((t, i) => ({
          time: t.toFixed(2),
          hip_angle: result.series.hip_angle[i],
          knee_angle: result.series.knee_angle[i],
          hip_moment: result.series.hip_moment[i],
          knee_moment: result.series.knee_moment[i],
          grf_v: result.series.grf_v[i],
          quad_activation: result.series.quad_activation[i],
          glute_activation: result.series.glute_activation[i],
          spine_comp: result.series.spine_comp[i],
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
    return <div className="w-full h-full flex items-center justify-center font-mono">Loading Simulation Data...</div>;
  }

  return (
    <div className="w-full h-full flex flex-wrap">
      <MiniChart data={data} title="Joint Angles (°)" dataKeys={['hip_angle', 'knee_angle']} />
      <MiniChart data={data} title="Joint Moments (Nm)" dataKeys={['hip_moment', 'knee_moment']} />
      <MiniChart data={data} title="Muscle Activation (%)" dataKeys={['quad_activation', 'glute_activation']} />
      <MiniChart data={data} title="Forces (N)" dataKeys={['grf_v', 'spine_comp']} />
    </div>
  );
};

export default ChartCanvas;