import React from 'react';
import './Header.css';

export default function Header({ stats, onRefresh, lastUpdated, isSimulating, onToggleSimulation, theme, onToggleTheme, onToggleNews, showNewsPanel }) {
  return (
    <header className="header" id="header">
      <div className="header-left">
        <div className="header-logo">CS</div>
        <div className="header-title">
          <h1>CivicShield</h1>
          <span>Civilian Crisis Intelligence System</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-stats">
          <div className="header-stat">
            <span className="header-stat-value high">{stats?.high ?? '–'}</span>
            <span className="header-stat-label">High Risk</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-value medium">{stats?.medium ?? '–'}</span>
            <span className="header-stat-label">Medium</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-value low">{stats?.low ?? '–'}</span>
            <span className="header-stat-label">Low Risk</span>
          </div>
        </div>

        <div className="header-live">
          <div className="live-dot"></div>
          {isSimulating ? 'SIMULATION' : 'LIVE'}
        </div>

        <button 
          className={`header-simulate ${isSimulating ? 'active' : ''}`}
          onClick={onToggleSimulation}
          title={isSimulating ? 'Exit simulation mode' : 'Simulate crisis scenario'}
        >
          {isSimulating ? '✕ Exit Simulation' : '⚡ Simulate Crisis'}
        </button>

        <button 
          className="header-theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button 
          className={`header-live-updates ${showNewsPanel ? 'active' : ''}`}
          onClick={onToggleNews} 
          id="live-updates-btn"
          title="View live crisis updates"
        >
          ⚡ Live Updates
        </button>
      </div>
    </header>
  );
}
