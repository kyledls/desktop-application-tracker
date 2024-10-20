const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const activeWin = require('active-win');
const fs = require('fs');

let mainWindow;
let currentApp = null;
let startTime = Date.now();
let paused = false;
let pauseStartTime = null; // Track when the pause starts
const usageData = {};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

// Function to format duration as hours, minutes, and seconds
function formatDuration(duration) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  } else if (minutes > 0) {
    return `${minutes} minutes, ${seconds} seconds`;
  } else {
    return `${seconds} seconds`;
  }
}

// Function to track time
function trackTime() {
  setInterval(async () => {
    if (paused) return; // Skip tracking if paused

    try {
      const window = await activeWin();
      const appName = window ? window.owner.name : 'Desktop';

      if (currentApp && currentApp !== appName) {
        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000);

        if (usageData[currentApp]) {
          usageData[currentApp].duration += duration;
        } else {
          usageData[currentApp] = {
            application: currentApp,
            duration: duration,
          };
        }

        usageData[currentApp].formattedDuration = formatDuration(usageData[currentApp].duration);
        startTime = Date.now();
      }

      currentApp = appName;

      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('data-updated', Object.values(usageData));
      }
    } catch (error) {
      console.error('Error tracking active window:', error);
    }
  }, 1000);
}

// IPC listener to handle pause/resume state
ipcMain.on('toggle-pause', (event, state) => {
  if (state) {
    // Pausing
    paused = true;
    pauseStartTime = Date.now();
    console.log('Tracking paused');
  } else {
    // Resuming
    if (pauseStartTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      startTime += pauseDuration; // Adjust startTime to exclude pause duration
      pauseStartTime = null;
    }
    paused = false;
    console.log('Tracking resumed');
  }
});

app.whenReady().then(() => {
  createWindow();
  trackTime();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});