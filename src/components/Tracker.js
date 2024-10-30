// src/components/Tracker.js
import './Tracker.css';
import React, { useState, useEffect } from 'react';
import UsageChart, { prepareChartData } from './UsageChart';
import ApplicationList from './ApplicationList';
import { saveData, loadData } from '../utils/storage';

const electron = window.require('electron');

function Tracker({ selectedTimeframe }) {
  const [usageData, setUsageData] = useState({});
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showAllApps, setShowAllApps] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const ITEMS_TO_SHOW = 3;

  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await loadData();
      setUsageData(savedData);
    };
    loadSavedData();
  }, []);

  useEffect(() => {
    if (Object.keys(usageData).length > 0) {
      saveData(usageData);
    }
  }, [usageData]);

  useEffect(() => {
    let timer;
    if (!isPaused) {
      timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

      electron.ipcRenderer.on('active-window-change', handleWindowChange);
    }

    return () => {
      if (timer) clearInterval(timer);
      electron.ipcRenderer.removeAllListeners('active-window-change');
    };
  }, [isPaused]);

  useEffect(() => {
    let updateTimer;
    if (!isPaused) {
      updateTimer = setInterval(() => {
        setUsageData(prevData => {
          const currentTime = Date.now();
          const updatedData = { ...prevData };
          
          Object.keys(updatedData).forEach(key => {
            if (updatedData[key].isActive && !isPaused) {
              const timeDiff = currentTime - updatedData[key].lastUpdated;
              updatedData[key] = {
                ...updatedData[key],
                elapsedTime: updatedData[key].elapsedTime + timeDiff,
                lastUpdated: currentTime
              };
            }
          });
          
          return updatedData;
        });
      }, 1000);
    }

    return () => {
      if (updateTimer) clearInterval(updateTimer);
    };
  }, [isPaused]);

  useEffect(() => {
    const handlePauseToggle = (_, isPausedState) => {
      setIsPaused(isPausedState);
    };

    electron.ipcRenderer.on('toggle-pause', handlePauseToggle);

    return () => {
      electron.ipcRenderer.removeListener('toggle-pause', handlePauseToggle);
    };
  }, []);

  useEffect(() => {
    // When pause state changes, update all active apps' lastUpdated timestamp
    setUsageData(prevData => {
      const currentTime = Date.now();
      const updatedData = { ...prevData };
      
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key].isActive) {
          updatedData[key] = {
            ...updatedData[key],
            lastUpdated: currentTime
          };
        }
      });
      
      return updatedData;
    });
  }, [isPaused]);

  useEffect(() => {
    const handleAppQuitting = async () => {
      // Update all active apps one last time before quitting
      setUsageData(prevData => {
        const currentTime = Date.now();
        const updatedData = { ...prevData };
        
        Object.keys(updatedData).forEach(key => {
          if (updatedData[key].isActive) {
            const timeDiff = currentTime - updatedData[key].lastUpdated;
            updatedData[key] = {
              ...updatedData[key],
              isActive: false,
              elapsedTime: updatedData[key].elapsedTime + timeDiff,
              lastUpdated: currentTime
            };
          }
        });
        
        // Save the final state
        saveData(updatedData);
        return updatedData;
      });

      // Clean up all intervals and listeners
      electron.ipcRenderer.removeAllListeners('active-window-change');
      electron.ipcRenderer.removeAllListeners('toggle-pause');
      electron.ipcRenderer.removeAllListeners('app-quitting');
    };

    electron.ipcRenderer.on('app-quitting', handleAppQuitting);

    return () => {
      electron.ipcRenderer.removeListener('app-quitting', handleAppQuitting);
    };
  }, []);

  useEffect(() => {
    const handleKeyboardEvent = (_, keyEvent) => {
      // Handle keyboard events here
      console.log('Keyboard event:', keyEvent);
      // Example: Toggle pause on specific key
      if (keyEvent.name === 'P' && keyEvent.state === 'DOWN') {
        setIsPaused(prev => !prev);
      }
    };

    electron.ipcRenderer.on('keyboard-event', handleKeyboardEvent);

    return () => {
      electron.ipcRenderer.removeListener('keyboard-event', handleKeyboardEvent);
    };
  }, []);

  const handleWindowChange = (event, windowInfo) => {
    const appId = windowInfo.name;
    
    setUsageData(prevData => {
      if (!appId?.trim()) return prevData;
      
      const currentTime = Date.now();
      const updatedData = { ...prevData };
      
      // Remove the isActive check to process all updates
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key].isActive) {
          const timeDiff = !isPaused ? currentTime - updatedData[key].lastUpdated : 0;
          updatedData[key] = {
            ...updatedData[key],
            isActive: false,
            elapsedTime: updatedData[key].elapsedTime + timeDiff,
            lastUpdated: currentTime
          };
        }
      });

      // Update or create new app
      if (!updatedData[appId]) {
        updatedData[appId] = {
          name: windowInfo.name,
          startTime: currentTime,
          elapsedTime: 0,
          isActive: !isPaused,
          lastUpdated: currentTime
        };
      } else {
        updatedData[appId] = {
          ...updatedData[appId],
          isActive: !isPaused,
          lastUpdated: currentTime
        };
      }

      return updatedData;
    });
  };

  return (
    <div className="tracker-container">
      <div className="controls">
        <button 
          className={`pause-button ${isPaused ? 'paused' : ''}`}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? 'Resume Tracking' : 'Pause Tracking'}
        </button>
      </div>
      <div className="usage-data">
        <UsageChart 
          data={prepareChartData(usageData)} 
        />
        <ApplicationList 
          usageData={usageData}
          showAllApps={showAllApps}
          setShowAllApps={setShowAllApps}
          ITEMS_TO_SHOW={ITEMS_TO_SHOW}
        />
      </div>
    </div>
  );
}

export default Tracker;