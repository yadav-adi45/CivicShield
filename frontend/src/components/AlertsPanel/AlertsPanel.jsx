import React, { useMemo } from 'react';
import './AlertsPanel.css';

const AlertsPanel = React.memo(function AlertsPanel({ predictions, onStateSelect }) {
  // Generate alerts from prediction data — focus on high-risk states
  const alerts = useMemo(() => {
    if (!predictions?.states) return [];

    const items = [];
    for (const state of predictions.states) {
      if (state.risk.risk_level === 'High') {
        // Add alert for each critical shortage
        const criticalShortages = state.shortages?.filter(s => s.severity === 'critical') || [];
        if (criticalShortages.length > 0) {
          items.push({
            state: state.state,
            code: state.code,
            severity: 'high',
            message: `Critical ${criticalShortages.map(s => s.resource_label).join(', ')} shortage detected`,
            score: state.risk.risk_score,
            type: 'shortage',
          });
        } else {
          items.push({
            state: state.state,
            code: state.code,
            severity: 'high',
            message: `High risk level (${(state.risk.risk_score * 100).toFixed(0)}%) — multiple crisis signals active`,
            score: state.risk.risk_score,
            type: 'risk',
          });
        }
      } else if (state.risk.risk_level === 'Medium') {
        const warningShortages = state.shortages?.filter(s => s.severity === 'critical' || s.severity === 'warning') || [];
        if (warningShortages.length > 0) {
          items.push({
            state: state.state,
            code: state.code,
            severity: 'medium',
            message: `Elevated ${warningShortages.slice(0, 2).map(s => s.resource_label).join(', ')} shortage risk`,
            score: state.risk.risk_score,
            type: 'warning',
          });
        }
      }
    }

    return items.sort((a, b) => b.score - a.score);
  }, [predictions]);

  const highCount = useMemo(() => 
    alerts.filter(a => a.severity === 'high').length,
    [alerts]
  );

  return (
    <div className="glass-card alerts-panel" id="alerts-panel">
      <div className="alerts-header">
        <h3 className="alerts-title">🚨 Active Alerts</h3>
        {highCount > 0 && <span className="alerts-count">{highCount} critical</span>}
      </div>

      {alerts.length > 0 ? (
        <div className="alerts-list">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="alert-item"
              onClick={() => onStateSelect(alert.code)}
            >
              <div className={`alert-severity-dot ${alert.severity}`} />
              <div className="alert-content">
                <span className="alert-state">{alert.state}</span>
                <span className="alert-message">{alert.message}</span>
                <div className="alert-meta">
                  <span>Risk: {(alert.score * 100).toFixed(0)}%</span>
                  <span>•</span>
                  <span>{alert.type === 'shortage' ? 'Supply Alert' : 'Risk Alert'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-alerts">
          <p>✅ No active alerts. All regions monitoring normal.</p>
        </div>
      )}
    </div>
  );
});

export default AlertsPanel;
