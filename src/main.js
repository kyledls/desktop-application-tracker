const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { saveData, loadData, resetData } = require('./utils/storage');

let tray = null;
let mainWindow = null;

// Add IPC handlers for data storage
ipcMain.handle('save-data', async (event, data) => {
  saveData(data);
});

ipcMain.handle('load-data', async () => {
  return loadData();
});

ipcMain.handle('reset-data', async () => {
  return resetData();
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.loadFile('src/index.html');
    mainWindow.webContents.openDevTools();

    // Hide window instead of closing when user clicks 'X'
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

function createTray() {
    // Create tray icon
    tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'));
    
    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Pause Tracking',
            type: 'checkbox',
            click: (menuItem) => {
                mainWindow.webContents.send('toggle-tracking', menuItem.checked);
            }
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    // Set tooltip and context menu
    tray.setToolTip('Application Usage Tracker');
    tray.setContextMenu(contextMenu);

    // Show window on tray icon click
    tray.on('click', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});