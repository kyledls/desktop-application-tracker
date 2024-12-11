import React, { useState } from 'react';

const AppList = ({ usageData, currentApp, timeUnit = 's', conversionFactor = 1 }) => {
  const [showAll, setShowAll] = useState(false);
  
  const sortedApps = Object.entries(usageData)
    .sort(([, timeA], [, timeB]) => {
      // If the time is a string (HH:MM:SS format), compare as is
      if (typeof timeA === 'string' && typeof timeB === 'string') {
        return timeB.localeCompare(timeA);
      }
      // Otherwise treat as numbers
      return timeB - timeA;
    });
    
  const displayApps = showAll ? sortedApps : sortedApps.slice(0, 3);
  const hasMore = sortedApps.length > 3;

  return (
    <div style={{
      width: '100%',
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxHeight: showAll ? '400px' : '200px',
      overflowY: 'auto',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '5px'
    }}>
      {displayApps.map(([app, time]) => (
        <div
          key={app}
          style={{
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderLeft: `4px solid ${app === currentApp ? '#4CAF50' : '#e0e0e0'}`,
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontWeight: '500' }}>{app}</div>
          <div style={{ 
            color: '#666',
            fontSize: '0.9em'
          }}>
            Time: {typeof time === 'string' ? time : `${(time/conversionFactor).toFixed(1)}${timeUnit}`}
          </div>
        </div>
      ))}
      
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            padding: '8px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '5px',
            color: '#666',
            fontFamily: 'HelveticaNowText-Light'
          }}
        >
          {showAll ? 'View Less' : `View ${sortedApps.length - 3} More`}
        </button>
      )}
    </div>
  );
};

export default AppList; 