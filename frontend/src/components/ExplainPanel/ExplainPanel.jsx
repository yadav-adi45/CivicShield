import React from 'react';
import './ExplainPanel.css';

export default function ExplainPanel({ explanation }) {
  if (!explanation) return null;

  return (
    <div className="glass-card explain-panel" id="explain-panel">
      <div className="explain-header">
        <h3 className="explain-title">🧠 Why This Prediction</h3>
        {explanation.confidence && (
          <span className={`explain-confidence ${explanation.confidence.level}`}>
            Confidence: {explanation.confidence.level.replace('_', ' ').toUpperCase()}
          </span>
        )}
      </div>

      <div className="explain-summary">{explanation.summary}</div>

      <div className="explain-factors">
        <div className="explain-factors-title">Contributing Factors</div>
        {explanation.contributing_factors?.map((factor, i) => (
          <div key={i} className="factor-item">
            <div className={`factor-impact ${factor.impact}`} />
            <div className="factor-content">
              <div className="factor-name">{factor.factor}</div>
              <div className="factor-detail">{factor.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
