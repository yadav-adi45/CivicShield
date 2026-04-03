import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRiskColor } from '../../utils/colorScale';
import { STATE_NAME_TO_CODE, STATE_CODE_TO_NAME } from '../../utils/constants';
import StateMap from './StateMap';
import './HeatMap.css';

/**
 * IndiaHeatMap — Interactive choropleth with state-level drill-down.
 *
 * Two view modes:
 * - "india": Shows all-India heatmap with state-level risk colors
 * - "state": Shows a single state's district-level map
 *
 * Transitions between views use framer-motion AnimatePresence
 * for smooth zoom-in/zoom-out animations.
 */
export default function IndiaHeatMap({ predictions, selectedState, onStateSelect }) {
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pathData, setPathData] = useState(null);

  // Derive view mode from selectedState prop
  const viewMode = selectedState ? 'state' : 'india';

  // Load India SVG paths
  useEffect(() => {
    fetch('/india-paths.json')
      .then((r) => r.json())
      .then((data) => setPathData(data))
      .catch((err) => console.error('Failed to load map:', err));
  }, []);

  // Build lookup: state_name → prediction data
  const stateDataMap = useMemo(() => {
    if (!predictions?.states) return {};
    const map = {};
    for (const st of predictions.states) {
      map[st.state] = st;
      map[st.code] = st;
    }
    return map;
  }, [predictions]);

  // Memoize color calculations for all states
  const stateColors = useMemo(() => {
    if (!pathData || !predictions?.states) return {};
    const colors = {};
    Object.keys(pathData).forEach((stateName) => {
      const stateData = stateDataMap[stateName];
      const riskScore = stateData?.risk?.risk_score ?? 0;
      colors[stateName] = getRiskColor(riskScore);
    });
    return colors;
  }, [pathData, predictions, stateDataMap]);

  // Get risk score for currently selected state
  const selectedStateRisk = useMemo(() => {
    if (!selectedState) return 0;
    return stateDataMap[selectedState]?.risk?.risk_score ?? 0;
  }, [selectedState, stateDataMap]);

  const selectedStateName = selectedState ? STATE_CODE_TO_NAME[selectedState] : '';

  // ── India Map Handlers ──────────────────────────────
  const handleMouseEnter = useCallback(
    (stateName) => {
      const stateData = stateDataMap[stateName];
      setTooltip({ name: stateName, data: stateData });
    },
    [stateDataMap]
  );

  const handleMouseMove = useCallback((evt) => {
    const rect = evt.currentTarget.closest('.map-wrapper').getBoundingClientRect();
    setMousePos({
      x: evt.clientX - rect.left + 15,
      y: evt.clientY - rect.top - 10,
    });
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const handleStateClick = useCallback(
    (stateName) => {
      const code = STATE_NAME_TO_CODE[stateName];
      if (code) {
        setTooltip(null);
        onStateSelect(code);
      }
    },
    [onStateSelect]
  );

  const handleBackToIndia = useCallback(() => {
    onStateSelect(null);
  }, [onStateSelect]);

  // ── Animation Variants ──────────────────────────────
  const indiaExitVariants = {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 1, scale: 1 },
    exit: {
      opacity: 0,
      scale: 1.3,
      transition: { duration: 0.4, ease: 'easeIn' },
    },
  };

  const indiaEnterVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 1.3,
      transition: { duration: 0.4, ease: 'easeIn' },
    },
  };

  const stateEnterVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };

  // ── Loading state ───────────────────────────────────
  if (!pathData) {
    return (
      <div className="heatmap-container">
        <div
          className="glass-card heatmap-card"
          style={{
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
            Loading map data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="heatmap-container">
      <div className="glass-card heatmap-card">
        {/* Header with title, legend, and back button */}
        <div className="heatmap-title">
          <h2>
            {viewMode === 'state' ? (
              <>
                <button
                  className="map-back-button"
                  onClick={handleBackToIndia}
                  title="Back to India map"
                  aria-label="Back to India map"
                >
                  ← 
                </button>
                <span>📍</span> {selectedStateName}
              </>
            ) : (
              <>
                <span>🗺️</span> India Risk Heatmap
              </>
            )}
          </h2>
          <div className="heatmap-legend">
            <div className="legend-item">
              <div className="legend-dot low" /> Low
            </div>
            <div className="legend-item">
              <div className="legend-dot medium" /> Medium
            </div>
            <div className="legend-item">
              <div className="legend-dot high" /> High
            </div>
          </div>
        </div>

        {/* Map container with animated transitions */}
        <div className="map-wrapper map-drill-container" id="india-heatmap">
          <AnimatePresence mode="wait">
            {viewMode === 'india' ? (
              /* ── India View ────────────────────────────── */
              <motion.div
                key="india-map"
                className="map-view-container"
                variants={indiaEnterVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <svg viewBox="0 0 600 700" className="india-svg">
                  {Object.entries(pathData).map(([stateName, d]) => {
                    const fillColor = stateColors[stateName] || getRiskColor(0);
                    const stateCode = STATE_NAME_TO_CODE[stateName];

                    return (
                      <path
                        key={stateName}
                        d={d}
                        className="state-geography"
                        fill={fillColor}
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeWidth={0.5}
                        onMouseEnter={() => handleMouseEnter(stateName)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleStateClick(stateName)}
                        data-state-code={stateCode}
                        style={{
                          cursor: 'pointer',
                          transition: 'fill 300ms ease, stroke-width 200ms ease',
                        }}
                      />
                    );
                  })}
                </svg>

                {/* India tooltip */}
                {tooltip && (
                  <div
                    className="state-tooltip"
                    style={{ left: mousePos.x, top: mousePos.y }}
                  >
                    <div className="tooltip-name">{tooltip.name}</div>
                    {tooltip.data ? (
                      <>
                        <div className="tooltip-risk">
                          <span className="tooltip-score">
                            {(tooltip.data.risk.risk_score * 100).toFixed(0)}%
                          </span>
                          <span
                            className={`tooltip-level ${tooltip.data.risk.risk_level.toLowerCase()}`}
                          >
                            {tooltip.data.risk.risk_level}
                          </span>
                        </div>
                        <div className="tooltip-click-hint">Click to explore →</div>
                        <div className="tooltip-shortages">
                          {tooltip.data.shortages?.slice(0, 3).map((s) => (
                            <div key={s.resource} className="tooltip-shortage-item">
                              <span>{s.resource_label}</span>
                              <div className="tooltip-shortage-bar-bg">
                                <div
                                  className="tooltip-shortage-bar"
                                  style={{
                                    width: `${s.probability * 100}%`,
                                    background: getRiskColor(s.probability),
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="tooltip-risk" style={{ color: 'var(--text-muted)' }}>
                        No data available
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              /* ── State Drill-Down View ─────────────────── */
              <motion.div
                key={`state-${selectedState}`}
                className="map-view-container state-view-container"
                variants={stateEnterVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <StateMap
                  stateCode={selectedState}
                  riskScore={selectedStateRisk}
                  stateName={selectedStateName}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
