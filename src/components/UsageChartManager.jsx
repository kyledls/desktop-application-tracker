import React, { useState, useEffect, useRef, useCallback } from 'react';
import TenSecondChart from './charts/TenSecondChart';
import HourlyChart from './charts/HourlyChart';
import DailyChart from './charts/DailyChart';
import WeeklyChart from './charts/WeeklyChart';
const activeWin = window.require('active-win');
const { ipcRenderer } = window.require('electron');

const UPDATE_INTERVAL = 50;
const TOTAL_TIME = 10;
const SAVE_INTERVAL = 1000; // Save every second instead of every minute

const UsageChartManager = ({ timeRange }) => {
  const [tenSecondData, setTenSecondData] = useState({});
  const [hourlyData, setHourlyData] = useState({});
  const [dailyData, setDailyData] = useState({});
  const [weeklyData, setWeeklyData] = useState({});
  const [lastActiveTime, setLastActiveTime] = useState({});
  const [colorMap, setColorMap] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  
  const lastUpdateTime = useRef(performance.now());

  // Load saved data on component mount
  useEffect(() => {
    ipcRenderer.invoke('load-data').then((savedData) => {
      if (savedData) {
        setTenSecondData(savedData.tenSecondData || {});
        setHourlyData(savedData.hourlyData || {});
        setDailyData(savedData.dailyData || {});
        setWeeklyData(savedData.weeklyData || {});
        setColorMap(savedData.colorMap || {});
      }
    });
  }, []);

  // Save data periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const dataToSave = {
        tenSecondData,
        hourlyData,
        dailyData,
        weeklyData,
        colorMap
      };
      ipcRenderer.invoke('save-data', dataToSave);
    }, SAVE_INTERVAL);

    return () => clearInterval(saveInterval);
  }, [tenSecondData, hourlyData, dailyData, weeklyData, colorMap]);

  const normalizeData = useCallback((data) => {
    const total = Object.values(data).reduce((sum, time) => sum + time, 0);
    if (total <= TOTAL_TIME) return data;
    
    const sortedApps = Object.keys(data).sort((a, b) => 
      (lastActiveTime[b] || 0) - (lastActiveTime[a] || 0)
    );
    
    const normalizedData = { ...data };
    let currentTotal = total;
    let index = sortedApps.length - 1;
    
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
  }, [lastActiveTime]);

  const getAppColor = useCallback((appName) => {
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
  }, [colorMap]);

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

        setLastActiveTime(prev => ({
          ...prev,
          [appName]: currentTime
        }));

        setTenSecondData(prev => {
          const updated = { ...prev };
          updated[appName] = (updated[appName] || 0) + timeDelta;
          
          const total = Object.values(updated).reduce((sum, time) => sum + time, 0);
          if (total > TOTAL_TIME) {
            Object.entries(updated).forEach(([app, time]) => {
              if (app !== appName) {
                updated[app] = Math.max(0, time - (timeDelta * 0.2));
              }
            });
          }
          
          return normalizeData(updated);
        });

        setHourlyData(prev => {
          const updated = { ...prev };
          updated[appName] = (updated[appName] || 0) + timeDelta;
          return updated;
        });

        setDailyData(prev => {
          const updated = { ...prev };
          updated[appName] = (updated[appName] || 0) + timeDelta;
          return updated;
        });

        setWeeklyData(prev => {
          const updated = { ...prev };
          updated[appName] = (updated[appName] || 0) + timeDelta;
          return updated;
        });

        lastUpdateTime.current = currentTime;
      }
    } catch (error) {
      console.error('Error tracking window:', error);
    }
  }, [isPaused, normalizeData]);

  useEffect(() => {
    const interval = setInterval(updateUsageData, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [updateUsageData]);

  useEffect(() => {
    const handleToggleTracking = (event, isPausedState) => {
        setIsPaused(isPausedState);
    };
    
    ipcRenderer.on('toggle-tracking', handleToggleTracking);
    
    return () => {
        ipcRenderer.removeListener('toggle-tracking', handleToggleTracking);
    };
  }, []);

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all tracking data? This cannot be undone.')) {
      const resetData = await ipcRenderer.invoke('reset-data');
      if (resetData) {
        setTenSecondData({});
        setHourlyData({});
        setDailyData({});
        setWeeklyData({});
        setColorMap({});
      }
    }
  };

  const renderChart = () => {
    const commonProps = {
      isPaused,
      setIsPaused,
      getAppColor,
      lastActiveTime
    };

    return (
      <div>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '14px' }}>🔄</span>
            Reset Data
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              padding: '8px 16px',
              backgroundColor: isPaused ? '#2ecc71' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
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
        {timeRange === '10s' && <TenSecondChart {...commonProps} usageData={tenSecondData} />}
        {timeRange === '1h' && <HourlyChart {...commonProps} usageData={hourlyData} />}
        {timeRange === '1d' && <DailyChart {...commonProps} usageData={dailyData} />}
        {timeRange === '1w' && <WeeklyChart {...commonProps} usageData={weeklyData} />}
      </div>
    );
  };

  return (
    <div>
      {renderChart()}
    </div>
  );
};

export default UsageChartManager; 