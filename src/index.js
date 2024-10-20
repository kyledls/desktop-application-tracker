import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import App from './app';

const Root = () => {
  const [usageData, setUsageData] = useState([]);

  useEffect(() => {
    // Fetch initial usage data from the Electron main process
    window.electron.getUsageData().then((data) => {
      console.log('Fetched usage data:', data); // Debug log
      setUsageData(data);
    });

    // Listen for real-time updates from the main process
    window.electron.onDataUpdate((data) => {
      console.log('Real-time update received:', data); // Debug log
      setUsageData(data);
    });
  }, []);

  return <App usageData={usageData} />;
};

ReactDOM.render(<Root />, document.getElementById('root'));