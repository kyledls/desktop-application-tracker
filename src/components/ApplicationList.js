import React from 'react';
import { formatTime } from '../utils/timeUtils';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const ApplicationList = ({ usageData, showAllApps, setShowAllApps, ITEMS_TO_SHOW }) => {
  const entries = Object.entries(usageData)
    .sort(([, a], [, b]) => b.elapsedTime - a.elapsedTime);
  const visibleEntries = showAllApps ? entries : entries.slice(0, ITEMS_TO_SHOW);

  return (
    <div className="app-list">
      {visibleEntries.map(([appId, data]) => (
        <div key={appId} className={`app-entry ${data.isActive ? 'active' : ''}`}>
          <h3>{data.name}</h3>
          <p>Time: {formatTime(data.elapsedTime)}</p>
        </div>
      ))}
      <div className="list-controls">
        {entries.length > ITEMS_TO_SHOW && !showAllApps && (
          <button className="view-more-button" onClick={() => setShowAllApps(true)}>
            View More
          </button>
        )}
        {showAllApps && (
          <button 
            className="view-less-button" 
            onClick={() => {
              setShowAllApps(false);
              scrollToTop();
            }}
          >
            View Less
          </button>
        )}
      </div>
    </div>
  );
};

export default ApplicationList; 