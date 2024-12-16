import React from 'react';
import { Bar } from 'react-chartjs-2';
import AppList from '../AppList';

const TOTAL_TIME = 86400; // 24 hours in seconds

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const DailyChart = ({ usageData, isPaused, setIsPaused, getAppColor, lastActiveTime, currentApp }) => {
  const chartData = {
    labels: Object.keys(usageData),
    datasets: [{
      label: 'Time Active (hours)',
      data: Object.values(usageData).map(seconds => seconds / 3600),
      backgroundColor: Object.keys(usageData).map(app => getAppColor(app).backgroundColor),
      borderColor: Object.keys(usageData).map(app => getAppColor(app).borderColor),
      borderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'HelveticaNowText-Light'
          }
        }
      },
      title: {
        display: true,
        text: 'Application Usage (Last 24 Hours)',
        font: {
          family: 'HelveticaNowText-Light',
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const app = context.label;
            const hours = context.raw.toFixed(1);
            const percentage = ((context.raw * 3600 / TOTAL_TIME) * 100).toFixed(1);
            return [`Time: ${hours}h (${percentage}%)`, 
                   `Last active: ${((performance.now() - lastActiveTime[app]) / 1000).toFixed(1)}s ago`];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}h`,
          font: {
            family: 'HelveticaNowText-Light'
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'HelveticaNowText-Light'
          }
        }
      }
    }
  };

  return (
    <div style={{ 
      width: '800px',
      height: '700px',
      padding: '20px'
    }}>
      <div style={{ width: '100%', height: '450px' }}>
        <Bar data={chartData} options={options} />
      </div>

      <AppList 
        usageData={Object.fromEntries(
          Object.entries(usageData).map(([app, time]) => [
            app,
            formatTime(time)
          ])
        )}
        currentApp={currentApp}
        timeUnit=""
        conversionFactor={1}
      />
    </div>
  );
};

export default DailyChart; 