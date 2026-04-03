import React, { useState, useEffect, useMemo } from 'react';
import { getStateMapUrl } from '../../maps/stateMapRegistry';
import { getRiskColor } from '../../utils/colorScale';

/**
 * StateMap — Renders a detailed district-level map for a single Indian state.
 * 
 * Loads per-state JSON data containing real district boundaries:
 * - name: State name
 * - code: State code
 * - viewBox: SVG viewBox for proper scaling
 * - districtCount: Number of districts
 * - districts: Object with district names as keys and SVG paths as values
 */
export default function StateMap({ stateCode, riskScore = 0, stateName }) {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  // Load state map data
  useEffect(() => {
    if (!stateCode) return;

    setLoading(true);
    setError(null);

    const url = getStateMapUrl(stateCode);
    if (!url) {
      const errorMsg = `No map configuration found for state code: ${stateCode}`;
      console.error(`[StateMap] ${errorMsg}`);
      setError(errorMsg);
      setLoading(false);
      return;
    }

    console.log(`[StateMap] Fetching map data for ${stateCode} from: ${url}`);

    fetch(url)
      .then((r) => {
        console.log(`[StateMap] Response status for ${stateCode}: ${r.status}`);
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}: Failed to load map file at ${url}`);
        }
        return r.json();
      })
      .then((data) => {
        console.log(`[StateMap] Successfully loaded ${stateCode} map:`, {
          name: data.name,
          code: data.code,
          districtCount: data.districtCount,
          actualDistricts: Object.keys(data.districts || {}).length
        });
        
        // Validate data structure
        if (!data.name || !data.code || !data.districts || !data.viewBox) {
          throw new Error('Invalid map data structure: missing required fields');
        }
        
        if (Object.keys(data.districts).length === 0) {
          throw new Error('Map data contains no districts');
        }
        
        setMapData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`[StateMap] Failed to load state map for ${stateCode}:`, err);
        console.error(`[StateMap] Attempted URL: ${url}`);
        setError(err.message);
        setLoading(false);
      });
  }, [stateCode]);

  // Generate color variations for districts based on state risk
  const districtColors = useMemo(() => {
    if (!mapData?.districts) return {};
    const baseColor = getRiskColor(riskScore);
    const colors = {};
    const districtNames = Object.keys(mapData.districts);

    districtNames.forEach((districtName, i) => {
      // Create luminance variations for visual depth between districts
      const variation = 0.75 + (i % 6) * 0.08;
      colors[districtName] = adjustBrightness(baseColor, variation);
    });

    return colors;
  }, [mapData, riskScore]);

  // Filter districts based on search query
  const filteredDistricts = useMemo(() => {
    if (!mapData?.districts || !searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase().trim();
    return Object.keys(mapData.districts).filter(name =>
      name.toLowerCase().includes(query)
    );
  }, [mapData, searchQuery]);

  const handleMouseMove = (evt) => {
    const rect = evt.currentTarget.closest('.state-map-wrapper').getBoundingClientRect();
    setMousePos({
      x: evt.clientX - rect.left + 15,
      y: evt.clientY - rect.top - 10,
    });
  };

  const handleSearchChange = (evt) => {
    setSearchQuery(evt.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHoveredDistrict(null);
  };

  if (loading) {
    return (
      <div className="state-map-loading">
        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
        <span className="loading-text">Loading {stateName || stateCode} map...</span>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="state-map-error">
        <div className="error-icon">⚠️</div>
        <div className="error-title">Map Data Unavailable</div>
        <div className="error-message">
          {error || 'Could not load state map'}
        </div>
        <div className="error-details">
          <div>State Code: {stateCode}</div>
          <div>State Name: {stateName || 'Unknown'}</div>
        </div>
      </div>
    );
  }

  const districtNames = Object.keys(mapData.districts);

  return (
    <div className="state-map-wrapper">
      {/* District Search */}
      <div className="district-search-container">
        <input
          type="text"
          className="district-search-input"
          placeholder={`Search ${mapData.districtCount} districts...`}
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search districts"
        />
        {searchQuery && (
          <button
            className="district-search-clear"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {filteredDistricts && filteredDistricts.length > 0 && (
          <div className="district-search-results">
            {filteredDistricts.length} district{filteredDistricts.length !== 1 ? 's' : ''} found
          </div>
        )}
        {filteredDistricts && filteredDistricts.length === 0 && (
          <div className="district-search-results">
            No districts found
          </div>
        )}
      </div>

      <svg
        viewBox={mapData.viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="state-map-svg"
        role="img"
        aria-label={`District map of ${mapData.name}`}
      >
        <defs>
          {/* Subtle glow filter for hovered districts */}
          <filter id="district-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render all districts */}
        {districtNames.map((districtName) => {
          const isHovered = hoveredDistrict === districtName;
          const isHighlighted = filteredDistricts && filteredDistricts.includes(districtName);
          const isDimmed = filteredDistricts && !isHighlighted;

          return (
            <path
              key={districtName}
              id={`district-${stateCode}-${districtName.replace(/\s+/g, '-')}`}
              d={mapData.districts[districtName]}
              className={`district-geography ${isHovered ? 'hovered' : ''}`}
              fill={districtColors[districtName] || getRiskColor(riskScore)}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth={isHovered || isHighlighted ? 1.5 : 0.5}
              onMouseEnter={() => setHoveredDistrict(districtName)}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredDistrict(null)}
              style={{
                cursor: 'pointer',
                transition: 'fill 200ms ease, stroke-width 150ms ease, opacity 200ms ease',
                filter: isHovered ? 'url(#district-glow)' : 'none',
                opacity: isDimmed ? 0.3 : 1,
              }}
            />
          );
        })}
      </svg>

      {/* District hover tooltip */}
      {hoveredDistrict && (
        <div
          className="district-tooltip"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="district-tooltip-name">{hoveredDistrict}</div>
          <div className="district-tooltip-state">{mapData.name}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Adjust color brightness by a factor. Handles both hex (#aabbcc) and rgb(r,g,b) formats.
 */
function adjustBrightness(color, factor) {
  let r, g, b;

  if (color.startsWith('#')) {
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  } else if (color.startsWith('rgb')) {
    const match = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      r = parseInt(match[1], 10);
      g = parseInt(match[2], 10);
      b = parseInt(match[3], 10);
    } else {
      return color;
    }
  } else {
    return color;
  }

  const nr = Math.min(255, Math.max(0, Math.round(r * factor)));
  const ng = Math.min(255, Math.max(0, Math.round(g * factor)));
  const nb = Math.min(255, Math.max(0, Math.round(b * factor)));

  return `rgb(${nr}, ${ng}, ${nb})`;
}
