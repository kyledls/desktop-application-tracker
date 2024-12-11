import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
const activeWin = window.require('active-win');

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TOTAL_TIME = 10;
const UPDATE_INTERVAL = 50;

const UsageChart = ({ timeRange }) => {
  const [usageData, setUsageData] = useState({});
  const [currentApp, setCurrentApp] = useState(null);
  const [lastActiveTime, setLastActiveTime] = useState({});
  const [colorMap, setColorMap] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const lastUpdateTime = useRef(performance.now());

  const normalizeData = useCallback((data, lastActiveTimes) => {
    const total = Object.values(data).reduce((sum, time) => sum + time, 0);
    if (total <= TOTAL_TIME) return data;
    
    // Sort apps by last active time (most recent first)
    const sortedApps = Object.keys(data).sort((a, b) => 
      (lastActiveTimes[b] || 0) - (lastActiveTimes[a] || 0)
    );
    
    const normalizedData = { ...data };
    let currentTotal = total;
    let index = sortedApps.length - 1; // Start with oldest app
    
    // Reduce time from older apps first
    while (currentTotal > TOTAL_TIME && index >= 0) {
      const app = sortedApps[index];
      const timeToReduce = Math.min(
        normalizedData[app],
        currentTotal - TOTAL_TIME
      );
      
      normalizedData[app] -= timeToReduce;
      currentTotal -= timeToReduce;
      
      if (normalizedData[app] <= 0) {
        delete normalizedData[app];
      }
      
      index--;
    }
    
    return normalizedData;
  }, []);

  const updateUsageData = useCallback(async () => {
    if (isPaused) return;
    
    try {
      const result = await activeWin();
      if (result) {
        const currentTime = performance.now();
        const appName = result.owner.name;
        const timeDelta = Math.min(
          (currentTime - lastUpdateTime.current) / 1000,
          0.1
        );

        setCurrentApp(appName);
        setLastActiveTime(prev => ({
          ...prev,
          [appName]: currentTime
        }));
        
        setUsageData(prevData => {
          const updatedData = { ...prevData };
          updatedData[appName] = (updatedData[appName] || 0) + timeDelta;
          
          // Only decrease inactive apps if total time exceeds limit
          const total = Object.values(updatedData).reduce((sum, time) => sum + time, 0);
          if (total > TOTAL_TIME) {
            Object.entries(updatedData).forEach(([app, time]) => {
              if (app !== appName) {
                updatedData[app] = Math.max(0, time - (timeDelta * 0.2));
              }
            });
          }
          
          return normalizeData(updatedData, lastActiveTime);
        });
        
        lastUpdateTime.current = currentTime;
      }
    } catch (error) {
      console.error('Error tracking window:', error);
    }
  }, [normalizeData, lastActiveTime, isPaused]);

  useEffect(() => {
    const interval = setInterval(updateUsageData, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [updateUsageData]);

  // Get consistent colors for apps
  const getAppColor = (appName) => {
    if (!colorMap[appName]) {
      const newColor = `hsla(${Object.keys(colorMap).length * 137.5}, 70%, 50%, 0.7)`;
      setColorMap(prev => ({
        ...prev,
        [appName]: {
          backgroundColor: newColor,
          borderColor: newColor.replace('0.7', '1')
        }
      }));
    }
    return colorMap[appName] || { 
      backgroundColor: 'hsla(0, 70%, 50%, 0.7)',
      borderColor: 'hsla(0, 70%, 50%, 1)'
    };
  };

  const chartData = {
    labels: Object.keys(usageData),
    datasets: [{
      label: 'Time Active (seconds)',
      data: Object.values(usageData),
      backgroundColor: Object.keys(usageData).map(app => 
        getAppColor(app).backgroundColor
      ),
      borderColor: Object.keys(usageData).map(app => 
        getAppColor(app).borderColor
      ),
      borderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
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
        text: 'Application Usage (Last 10 Seconds)',
        font: {
          family: 'HelveticaNowText-Light',
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const app = context.label;
            const time = context.raw.toFixed(1);
            const percentage = ((context.raw / TOTAL_TIME) * 100).toFixed(1);
            return [`Time: ${time}s (${percentage}%)`, 
                   `Last active: ${((performance.now() - lastActiveTime[app]) / 1000).toFixed(1)}s ago`];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: TOTAL_TIME,
        ticks: {
          stepSize: 1,
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
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
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
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isPaused ? (
            <>
              <span style={{ fontSize: '14px' }}>▶️</span>
              Resume Tracking
            </>
          ) : (
            <>
              <span style={{ fontSize: '14px' }}>⏸</span>
              Pause Tracking
            </>
          )}
        </button>
      </div>
      
      <div style={{ width: '100%', height: '450px' }}>
        <Bar 
          data={chartData} 
          options={{
            ...options,
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                setSelectedApp(Object.keys(usageData)[index]);
              }
            }
          }} 
        />
      </div>
      
      <div style={{
        width: '100%',
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxHeight: '200px',
        overflowY: 'auto',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '5px'
      }}>
        {Object.entries(usageData).map(([app, time]) => (
          <div
            key={app}
            onClick={() => setSelectedApp(app)}
            style={{
              padding: '10px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              borderLeft: app === currentApp ? '4px solid #90EE90' : '4px solid transparent'
            }}
          >
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontWeight: '500' }}>{app}</span>
              <span style={{ 
                color: '#666',
                fontSize: '0.9em'
              }}>
                Time: {time.toFixed(1)}s
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageChart; 