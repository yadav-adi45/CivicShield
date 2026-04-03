import React from 'react';
import './RiskIndicators.css';

const RiskBadge = React.memo(function RiskBadge({ stats, onRiskClick }) {
  const badges = [
    { key: 'high', label: 'High Risk States', value: stats?.high ?? 0, icon: '🔴' },
    { key: 'medium', label: 'Medium Risk States', value: stats?.medium ?? 0, icon: '🟡' },
    { key: 'low', label: 'Low Risk States', value: stats?.low ?? 0, icon: '🟢' },
  ];

  return (
    <div className="risk-indicators" id="risk-indicators">
      {badges.map((badge) => (
        <div 
          key={badge.key} 
          className={`glass-card risk-badge ${badge.key} ${onRiskClick ? 'clickable' : ''}`}
          onClick={() => onRiskClick && onRiskClick(badge.key)}
        >
          <div className="risk-badge-icon">{badge.icon}</div>
          <div className="risk-badge-content">
            <div className="risk-badge-value">{badge.value}</div>
            <div className="risk-badge-label">{badge.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default RiskBadge;
