import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import './ChartCanvas.css';

const LINE_COLORS = {
  hip_angle: '#2E4374',
  knee_angle: '#A23B72',
  hip_moment: '#355834',
  knee_moment: '#C9733F',
  quad_activation: '#474973',
  glute_activation: '#B26E63',
  grf_v: '#2B3A55',
  spine_comp: '#D28C2E',
};

const FALLBACK_SERIES = Array.from({ length: 50 }).map((_, index) => {
  const time = Number((index * 0.04).toFixed(2));
  return {
    time,
    hip_angle: 80 + 20 * Math.sin(time * 1.3),
    knee_angle: 75 + 18 * Math.sin(time * 1.35 + 0.3),
    hip_moment: 240 + 50 * Math.sin(time * 1.4 + 0.5),
    knee_moment: 200 + 40 * Math.sin(time * 1.45 + 0.7),
    quad_activation: (0.55 + 0.2 * Math.sin(time * 1.5)) * 100,
    glute_activation: (0.45 + 0.25 * Math.sin(time * 1.65 + 0.4)) * 100,
    grf_v: 1200 + 90 * Math.sin(time * 1.2),
    spine_comp: 2400 + 120 * Math.sin(time * 1.1 + 0.3),
  };
});

const formatValue = (value) => {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return value.toFixed(0);
  }
  if (absValue >= 100) {
    return value.toFixed(1);
  }
  return value.toFixed(2);
};

const MiniChart = ({ data, title, dataKeys, axisLabel }) => (
  <div className="mini-chart">
    <div className="mini-chart__header">
      <h4 className="mini-chart__title">{title}</h4>
      {axisLabel ? <span className="mini-chart__axis">{axisLabel}</span> : null}
    </div>
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
        <CartesianGrid stroke="#1C1C1C" strokeOpacity={0.25} strokeDasharray="4 3" />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={{ stroke: '#1C1C1C' }}
          tick={{ fontFamily: 'Geneva, sans-serif', fontSize: 11 }}
          tickFormatter={(value) => value.toFixed(1)}
        />
        <YAxis
          tickLine={false}
          axisLine={{ stroke: '#1C1C1C' }}
          tick={{ fontFamily: 'Geneva, sans-serif', fontSize: 11 }}
          width={48}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#F7F7F2',
            border: '1px solid #1C1C1C',
            fontFamily: 'Geneva, sans-serif',
            fontSize: 12,
          }}
          labelFormatter={(value) => `t = ${value.toFixed(2)} s`}
          formatter={(value, name) => [formatValue(value), name.replace(/_/g, ' ')]}
        />
        {dataKeys.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={LINE_COLORS[key] || '#1C1C1C'}
            strokeWidth={2}
            dot={{ r: 2, strokeWidth: 1, fill: '#F7F7F2', stroke: LINE_COLORS[key] || '#1C1C1C' }}
            activeDot={{ r: 4 }}
            connectNulls
          />
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
          time: Number(Number(t).toFixed(2)),
          hip_angle: Number(result.series.hip_angle[i]),
          knee_angle: Number(result.series.knee_angle[i]),
          hip_moment: Number(result.series.hip_moment[i]),
          knee_moment: Number(result.series.knee_moment[i]),
          grf_v: Number(result.series.grf_v[i]),
          quad_activation: Number(result.series.quad_activation[i]) * 100,
          glute_activation: Number(result.series.glute_activation[i]) * 100,
          spine_comp: Number(result.series.spine_comp[i]),
        }));
        setData(transformedData);
      } catch (error) {
        console.error("Failed to fetch simulation data:", error);
        setData(FALLBACK_SERIES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="chart-canvas__loading" aria-live="polite">
        Loading Simulation Data...
      </div>
    );
  }

  return (
    <div className="chart-canvas" aria-label={title}>
      <MiniChart
        data={data}
        title="Joint Angles"
        axisLabel="Degrees"
        dataKeys={['hip_angle', 'knee_angle']}
      />
      <MiniChart
        data={data}
        title="Joint Moments"
        axisLabel="Nm"
        dataKeys={['hip_moment', 'knee_moment']}
      />
      <MiniChart
        data={data}
        title="Muscle Activation"
        axisLabel="%"
        dataKeys={['quad_activation', 'glute_activation']}
      />
      <MiniChart
        data={data}
        title="External Forces"
        axisLabel="N"
        dataKeys={['grf_v', 'spine_comp']}
      />
    </div>
  );
};

export default ChartCanvas;