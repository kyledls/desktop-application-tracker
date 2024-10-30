import React, { useState } from 'react';
import Tracker from './components/Tracker';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);

  const handleTimeframeSelect = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <div className="App">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onTimeframeSelect={handleTimeframeSelect}
      />
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <h1>App Time Tracker</h1>
        <Tracker selectedTimeframe={selectedTimeframe} />
      </div>
    </div>
  );
}

export default App;