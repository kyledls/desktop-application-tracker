import React, { useState } from 'react';

const Sidebar = ({ isOpen, onClose, onTimeRangeChange, onLogout, isGuestMode, onLoginClick, username, email }) => {
  const [selectedRange, setSelectedRange] = React.useState('10s');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const timeOptions = [
    { id: '10s', label: 'Last 10 Seconds' },
    { id: '1h', label: 'Last Hour' },
    { id: '1d', label: 'Last Day' },
    { id: '1w', label: 'Last Week' }
  ];

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    onTimeRangeChange(range);
  };

  const timeRangeStyle = (range) => ({
    padding: '12px 20px',
    cursor: 'pointer',
    color: selectedRange === range ? '#fff' : '#ddd',
    backgroundColor: selectedRange === range ? '#4A5B6D' : 'transparent',
    transition: 'all 0.2s ease',
    borderRadius: '4px',
    transform: selectedRange === range ? 'translateX(2px)' : 'translateX(0)',
    boxShadow: selectedRange === range ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
  });

  const buttonStyle = {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#4A5B6D',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: 'normal',
    boxShadow: 'none',
    outline: 'none',
  };

  const dropdownItemStyle = {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 'normal',
    textAlign: 'left',
    boxShadow: 'none',
    outline: 'none',
    margin: 0,
    borderRadius: 0
  };

  const handleMouseEnter = (e) => {
    const isSelected = e.currentTarget.getAttribute('data-selected') === 'true';
    if (!isSelected) {
      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.transform = 'translateX(2px)';
    }
  };

  const handleMouseLeave = (e) => {
    const isSelected = e.currentTarget.getAttribute('data-selected') === 'true';
    if (!isSelected) {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.transform = 'translateX(0)';
    }
  };

  const loginContainerStyle = {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    padding: '0 20px'
  };

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: isOpen ? '250px' : '0',
      height: '100vh',
      backgroundColor: '#5A6B7D',
      color: 'white',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      zIndex: 1000,
      paddingTop: '50px',
      boxShadow: isOpen ? '2px 0 5px rgba(0,0,0,0.1)' : 'none'
    }}>
      <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {!isGuestMode ? (
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={buttonStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span>{username}</span>
              <span style={{ 
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s'
              }}>▼</span>
            </button>
            
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#4A5B6D',
                borderRadius: '4px',
                marginTop: 0,
                boxShadow: 'none',
                zIndex: 1002,
                overflow: 'hidden'
              }}>
                <div style={{
                  ...dropdownItemStyle,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                >
                  {email}
                </div>
                <button
                  onClick={onLogout}
                  style={dropdownItemStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={loginContainerStyle}>
            <button
              onClick={onLoginClick}
              style={{
                ...buttonStyle,
                height: '45px',
                fontSize: '16px',
                fontWeight: '500',
                justifyContent: 'center',
                backgroundColor: '#4A5B6D',
                width: '100%',
                transition: 'all 0.2s ease',
                transform: 'translateY(0)',
                ':hover': {
                  backgroundColor: '#5A6B7D',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Login
            </button>
          </div>
        )}

        <div style={{
          fontSize: '16px',
          fontWeight: 'normal',
          marginBottom: '20px',
          padding: '0 20px'
        }}>
          Desktop Application Time Usage
        </div>

        {timeOptions.map(({ id, label }) => (
          <div
            key={id}
            onClick={() => handleRangeSelect(id)}
            style={timeRangeStyle(id)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-selected={selectedRange === id}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 