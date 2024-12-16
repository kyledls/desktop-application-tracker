const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let saveTimeout = null;

const getStorageFilePath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'appUsageData.json');
};

const saveData = (data) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    try {
      const filePath = getStorageFilePath();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, 100);
};

const resetData = () => {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return {
      tenSecondData: {},
      hourlyData: {},
      dailyData: {},
      weeklyData: {},
      colorMap: {}
    };
  } catch (error) {
    console.error('Error resetting data:', error);
    return null;
  }
};

const loadData = () => {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return {
      tenSecondData: {},
      hourlyData: {},
      dailyData: {},
      weeklyData: {},
      colorMap: {}
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      tenSecondData: {},
      hourlyData: {},
      dailyData: {},
      weeklyData: {},
      colorMap: {}
    };
  }
};

module.exports = {
  saveData,
  loadData,
  resetData
}; 