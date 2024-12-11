import React, { useState, useEffect, useRef, useCallback } from 'react';
import TenSecondChart from './charts/TenSecondChart';
import HourlyChart from './charts/HourlyChart';
import DailyChart from './charts/DailyChart';
import WeeklyChart from './charts/WeeklyChart';
const activeWin = window.require('active-win');

const UPDATE_INTERVAL = 50;
const TOTAL_TIME = 10;

const UsageChartManager = ({ timeRange }) => {
  const [tenSecondData, setTenSecondData] = useState({});
  const [hourlyData, setHourlyData] = useState({});
  const [dailyData, setDailyData] = useState({});
  const [weeklyData, setWeeklyData] = useState({});
  const [lastActiveTime, setLastActiveTime] = useState({});
  const [colorMap, setColorMap] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  
  const lastUpdateTime = useRef(performance.now());

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

  const renderChart = () => {
    const commonProps = {
      isPaused,
      setIsPaused,
      getAppColor,
      lastActiveTime
    };

    switch (timeRange) {
      case '10s':
        return <TenSecondChart {...commonProps} usageData={tenSecondData} />;
      case '1h':
        return <HourlyChart {...commonProps} usageData={hourlyData} />;
      case '1d':
        return <DailyChart {...commonProps} usageData={dailyData} />;
      case '1w':
        return <WeeklyChart {...commonProps} usageData={weeklyData} />;
      default:
        return <TenSecondChart {...commonProps} usageData={tenSecondData} />;
    }
  };

  return (
    <div>
      {renderChart()}
    </div>
  );
};

export default UsageChartManager; 