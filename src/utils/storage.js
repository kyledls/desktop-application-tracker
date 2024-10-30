const { ipcRenderer } = window.require('electron');

export const saveData = (data) => {
  ipcRenderer.send('save-data', data);
};

export const loadData = () => {
  return new Promise((resolve) => {
    ipcRenderer.send('load-data');
    ipcRenderer.once('data-loaded', (_, data) => {
      resolve(data || {});
    });
  });
}; 