import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, onTimeframeSelect }) => {
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  const handleTimeframeSelect = (timeframe) => {
    onTimeframeSelect(timeframe);
    setIsTimeframeOpen(false);
  };

  return (
    <>
      <button className="toggle-button" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="menu-item">
            <div 
              className="dropdown-header" 
              onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
            >
              Select Timeframe
              <span>{isTimeframeOpen ? '▼' : '▶'}</span>
            </div>
            <div className={`dropdown-content ${isTimeframeOpen ? 'show' : ''}`}>
              <div 
                className="dropdown-item" 
                onClick={() => handleTimeframeSelect('today')}
              >
                Today
              </div>
              <div 
                className="dropdown-item" 
                onClick={() => handleTimeframeSelect('week')}
              >
                This Week
              </div>
              <div 
                className="dropdown-item" 
                onClick={() => handleTimeframeSelect('month')}
              >
                This Month
              </div>
              <div 
                className="dropdown-item" 
                onClick={() => handleTimeframeSelect('all')}
              >
                All Time
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 