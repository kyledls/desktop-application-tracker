import React, { useState, useEffect } from 'react';

// Function to format duration in a human-readable way
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

const App = () => {
  const [usageData, setUsageData] = useState([]); // State for tracking usage data
  const [paused, setPaused] = useState(false); // State for tracking pause/resume

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

  // Function to toggle pause/resume
  const togglePause = () => {
    setPaused((prevPaused) => {
      const newPaused = !prevPaused;
      window.electron.send('toggle-pause', newPaused);
      return newPaused;
    });
  };

  return (
    <div>
      <h1>Desktop Application Tracker</h1>
      {usageData.length > 0 ? (
        <ul>
          {usageData.map((item, index) => (
            <li key={index}>
              <strong>{item.application}</strong>: {formatDuration(item.duration)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No data available or loading...</p>
      )}
      {/* Move the button below the text */}
      <button onClick={togglePause} style={{ marginTop: '20px' }}>
        {paused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
};

export default App;