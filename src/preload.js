const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getUsageData: () => ipcRenderer.invoke('get-usage-data'),
  onDataUpdate: (callback) => ipcRenderer.on('data-updated', (event, data) => callback(data)),
  send: (channel, data) => ipcRenderer.send(channel, data),
});