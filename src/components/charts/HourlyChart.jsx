import React from 'react';
import { Bar } from 'react-chartjs-2';
import AppList from '../AppList';

const TOTAL_TIME = 3600; // 1 hour in seconds

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const HourlyChart = ({ usageData, isPaused, setIsPaused, getAppColor, lastActiveTime, currentApp }) => {
  const chartData = {
    labels: Object.keys(usageData),
    datasets: [{
      label: 'Time Active (minutes)',
      data: Object.values(usageData).map(seconds => seconds / 60),
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
        text: 'Application Usage (Last Hour)',
        font: {
          family: 'HelveticaNowText-Light',
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const app = context.label;
            const minutes = context.raw.toFixed(1);
            const percentage = ((context.raw * 60 / TOTAL_TIME) * 100).toFixed(1);
            return [`Time: ${minutes}m (${percentage}%)`, 
                   `Last active: ${((performance.now() - lastActiveTime[app]) / 1000).toFixed(1)}s ago`];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}m`,
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
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '10px'
      }}>
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            padding: '8px 16px',
            backgroundColor: isPaused ? '#2ecc71' : '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isPaused ? 'Resume Tracking' : 'Pause Tracking'}
        </button>
      </div>
      
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

export default HourlyChart; 