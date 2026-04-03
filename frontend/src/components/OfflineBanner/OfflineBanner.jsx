import React from 'react';
import './OfflineBanner.css';

export default function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return (
    <div className="offline-banner">
      <div className="offline-banner-content">
        <span className="offline-icon">📡</span>
        <div className="offline-text">
          <span className="offline-title">Offline Mode Active</span>
          <span className="offline-subtitle">
            Limited functionality • Emergency guides available • Reconnect for live data
          </span>
        </div>
      </div>
    </div>
  );
}
