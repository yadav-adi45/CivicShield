import React from 'react';
import { RESOURCE_ICONS } from '../../utils/constants';
import './PredictionCards.css';

const PredictionCard = React.memo(function PredictionCard({ shortage }) {
  const icon = RESOURCE_ICONS[shortage.resource] || '📦';
  const trendArrow = shortage.trend === 'rising' ? '↑' : shortage.trend === 'falling' ? '↓' : '→';
  const probPercent = (shortage.probability * 100).toFixed(0);

  return (
    <div className={`glass-card prediction-card ${shortage.severity}`} id={`prediction-${shortage.resource}`}>
      <div className="card-header">
        <div className="card-resource">
          <span className="card-icon">{icon}</span>
          <span className="card-name">{shortage.resource_label}</span>
        </div>
        <span className={`card-trend ${shortage.trend}`}>
          {trendArrow} {shortage.trend}
        </span>
      </div>

      <div className="card-probability">
        <div className="card-prob-label">Shortage Probability</div>
        <div className="card-prob-value">{probPercent}%</div>
      </div>

      <div className="card-bar-bg">
        <div className="card-bar-fill" style={{ width: `${probPercent}%` }} />
      </div>

      <div className="card-footer">
        <span className="card-signal-count">
          📡 {shortage.signal_count} signal{shortage.signal_count !== 1 ? 's' : ''}
        </span>
        <span>{shortage.severity.toUpperCase()}</span>
      </div>
    </div>
  );
});

export default function CardGrid({ shortages, title }) {
  if (!shortages || shortages.length === 0) return null;

  return (
    <div className="prediction-section">
      {title && <h3 className="prediction-section-title">📊 {title}</h3>}
      <div className="card-grid">
        {shortages.map((s) => (
          <PredictionCard key={s.resource} shortage={s} />
        ))}
      </div>
    </div>
  );
}
