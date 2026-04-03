import React from 'react';
import './ActionPanel.css';

export default function ActionPanel({ actions }) {
  return (
    <div className="glass-card action-panel" id="action-panel">
      <h3 className="action-title">🎯 What Should You Do</h3>

      {actions && actions.length > 0 ? (
        <div className="action-list">
          {actions.map((action, i) => (
            <div key={i} className="action-item">
              <div className="action-item-header">
                <span className="action-resource">{action.resource}</span>
                <span className={`action-urgency ${action.urgency}`}>
                  {action.urgency}
                </span>
              </div>
              <p className="action-recommendation">{action.recommendation}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-actions">
          <div className="no-actions-icon">✅</div>
          <p>No immediate actions required. All systems stable.</p>
        </div>
      )}
    </div>
  );
}
