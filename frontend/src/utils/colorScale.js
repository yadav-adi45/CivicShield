import { scaleLinear } from 'd3-scale';

// Risk score → Color mapping
// Low (green) → Medium (amber) → High (red)
export const riskColorScale = scaleLinear()
  .domain([0, 0.4, 0.7, 1.0])
  .range(['#1a3a2a', '#2d4a00', '#6b3500', '#6b1025'])
  .clamp(true);

export const riskFillScale = scaleLinear()
  .domain([0, 0.4, 0.7, 1.0])
  .range(['#00e676', '#a8d800', '#ffb800', '#ff3b5c'])
  .clamp(true);

export function getRiskColor(score) {
  return riskFillScale(score);
}

export function getRiskGlow(score) {
  if (score >= 0.7) return 'var(--risk-high-glow)';
  if (score >= 0.4) return 'var(--risk-medium-glow)';
  return 'var(--risk-low-glow)';
}

export function getRiskLevel(score) {
  if (score >= 0.7) return 'High';
  if (score >= 0.4) return 'Medium';
  return 'Low';
}

export function getRiskCSSClass(level) {
  switch (level) {
    case 'High': return 'risk-high';
    case 'Medium': return 'risk-medium';
    case 'Low': return 'risk-low';
    default: return 'risk-low';
  }
}
