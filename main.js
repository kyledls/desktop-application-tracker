const { app, BrowserWindow, ipcMain, Tray, Menu, screen, globalShortcut } = require('electron');
const path = require('path');
const activeWin = require('active-win');
const fs = require('fs');
const { GlobalKeyboardListener } = require('node-global-key-listener');
const keyboardListener = new GlobalKeyboardListener();

let mainWindow;
let tray;
let isQuitting = false;
let trackingInterval;
let lastMousePosition = { x: 0, y: 0 };
let lastActiveTime = Date.now();
const ACTIVITY_TIMEOUT = 2000; // 2 seconds

const getDataPath = () => {
  return path.join(app.getPath('userData'), 'usage-data.json');
};

function stopTracking() {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
}

const quitApp = () => {
  isQuitting = true;
  stopTracking();
  mainWindow?.webContents?.send('app-quitting');
  if (tray) {
    tray.destroy();
  }
  app.quit();
};

app.on('before-quit', () => {
  quitApp();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    quitApp();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    skipTaskbar: false,
    backgroundThrottling: false
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    } else {
      stopTracking();
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);
  
  // Start tracking active window
  startWindowTracking();

  // Create tray icon with context menu
  const iconPath = path.join(__dirname, 'icons', 'icon.png');
  console.log('Looking for icon at:', iconPath);

  try {
    if (!fs.existsSync(iconPath)) {
      console.error('Icon file does not exist at:', iconPath);
      return;
    }
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open App Time Tracker',
        click: () => {
          mainWindow.show();
          mainWindow.focus();
        }
      },
      { type: 'separator' },
      {
        label: 'Pause Tracking',
        type: 'checkbox',
        checked: false,
        click: (menuItem) => {
          mainWindow.webContents.send('toggle-pause', menuItem.checked);
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => quitApp()
      }
    ]);

    tray.setToolTip('App Time Tracker');
    tray.setContextMenu(contextMenu);
  } catch (error) {
    console.error('Failed to create tray:', error);
  }

  // Handle left click
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Setup global keyboard listener
  keyboardListener.addListener(function (e, down) {
    // Check if window exists before sending events
    if (mainWindow && !mainWindow.isDestroyed()) {
      // Send keyboard event to renderer
      mainWindow.webContents.send('keyboard-event', {
        name: e.name,
        state: down ? 'DOWN' : 'UP',
        vKey: e.vKey
      });
    }
  });

  // Clean up keyboard listener when app quits
  app.on('will-quit', () => {
    keyboardListener.kill();
  });
}

// Add an array of applications to ignore
const ignoredApps = [
  'Application Frame Host',
  'Windows Shell Experience Host',
  'SearchHost',
  'explorer',
  'SearchApp',
  'StartMenuExperienceHost'
];

function checkUserActivity() {
  const cursorPosition = screen.getCursorScreenPoint();
  const currentTime = Date.now();

  // Check if mouse has moved
  if (cursorPosition.x !== lastMousePosition.x || cursorPosition.y !== lastMousePosition.y) {
    lastMousePosition = { x: cursorPosition.x, y: cursorPosition.y };
    lastActiveTime = currentTime;
    return true;
  }

  // Consider user active if last activity was within ACTIVITY_TIMEOUT
  return (currentTime - lastActiveTime) < ACTIVITY_TIMEOUT;
}

async function startWindowTracking() {
  stopTracking();

  // Add IPC handlers
  ipcMain.on('save-data', (_, data) => {
    try {
      fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  });

  ipcMain.on('load-data', (event) => {
    try {
      const dataPath = getDataPath();
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        event.reply('data-loaded', data);
      } else {
        event.reply('data-loaded', {});
      }
    } catch (error) {
      console.error('Error loading data:', error);
      event.reply('data-loaded', {});
    }
  });

  ipcMain.on('quit-app', () => {
    quitApp();
  });

  trackingInterval = setInterval(async () => {
    try {
      if (!isQuitting && mainWindow && !mainWindow.isDestroyed()) {
        const windowInfo = await activeWin();
        const isActive = checkUserActivity();

        if (windowInfo && !ignoredApps.includes(windowInfo.owner.name)) {
          mainWindow.webContents.send('active-window-change', {
            name: windowInfo.owner.name,
            path: windowInfo.owner.path,
            isActive
          });
        }
      }
    } catch (error) {
      console.error('Error tracking window:', error);
    }
  }, 1000);
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('ready', () => {
  // Existing ready handler code...

  // Register a keyboard shortcut
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    // Send event to renderer process to toggle pause
    mainWindow.webContents.send('toggle-pause')
  })
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
});
