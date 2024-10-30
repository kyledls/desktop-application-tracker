import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p>{`${data.name}`}</p>
        <p>{`Time: ${data.value} ${data.unit}`}</p>
      </div>
    );
  }
  return null;
};

export const prepareChartData = (usageData, timeframe) => {
  return Object.entries(usageData)
    .map(([_, data]) => {
      let value, unit;
      
      if (timeframe === 'past-minute') {
        value = Math.round((data.elapsedTime / 1000) * 10) / 10;
        unit = 'seconds';
      } else {
        value = Math.floor(data.elapsedTime / (1000 * 60));
        unit = 'minutes';
      }

      return {
        name: data.name,
        value: value,
        unit: unit
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
};

const UsageChart = ({ data, timeframe }) => {
  const yAxisLabel = timeframe === 'past-minute' ? 'Seconds' : 'Minutes';
  
  return (
    <div className="usage-chart">
      <h2>Usage Statistics</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis 
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#4A90E2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart; 