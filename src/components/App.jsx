import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import UsageChartManager from './UsageChartManager';
import Login from './Login';

const App = () => {
  const [timeRange, setTimeRange] = useState('10s');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    if (token) {
      setIsAuthenticated(true);
      setUsername(storedUsername || '');
      setEmail(storedEmail || '');
    }
  }, []);

  const handleLogin = () => {
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    setUsername(storedUsername || '');
    setEmail(storedEmail || '');
    setIsAuthenticated(true);
    setIsGuestMode(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    setIsGuestMode(false);
    setUsername('');
    setEmail('');
  };

  const handleSkipLogin = () => {
    localStorage.removeItem('token');
    setIsGuestMode(true);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onSkipLogin={handleSkipLogin} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          padding: '8px 12px',
          backgroundColor: '#5A6B7D',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 1001,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          ':hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.25)'
          }
        }}
      >
        ☰
      </button>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onTimeRangeChange={setTimeRange}
        onLogout={handleLogout}
        isGuestMode={isGuestMode}
        onLoginClick={() => setIsAuthenticated(false)}
        username={username}
        email={email}
      />
      <div style={{ 
        flex: 1, 
        padding: '20px',
        marginLeft: isSidebarOpen ? '250px' : '0',
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <UsageChartManager timeRange={timeRange} />
      </div>
    </div>
  );
};

export default App; 