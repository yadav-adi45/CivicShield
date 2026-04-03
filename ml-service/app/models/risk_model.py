"""CivicShield ML — Risk Score Engine

Computes a normalized risk score (0.0–1.0) for each Indian state
based on weighted signals from news analysis.
"""
import numpy as np
from ..utils.config import (
    WEIGHT_SUPPLY_DISRUPTION,
    WEIGHT_DEMAND_SPIKE,
    WEIGHT_NEWS_SEVERITY,
    HIGH_RISK_THRESHOLD,
    MEDIUM_RISK_THRESHOLD,
)


def compute_risk_score(news_signals: list, baseline: dict) -> dict:
    """
    Compute overall risk score for a state.

    Args:
        news_signals: List of dicts with keys: headline, category, severity, source, date
        baseline: Dict of resource baseline shortage probabilities

    Returns:
        Dict with risk_score, risk_level, component_scores
    """
    if not news_signals:
        avg_baseline = np.mean(list(baseline.values())) if baseline else 0.0
        return {
            "risk_score": round(float(avg_baseline * 0.3), 3),
            "risk_level": classify_risk(avg_baseline * 0.3),
            "component_scores": {
                "supply_disruption": 0.0,
                "demand_spike": 0.0,
                "news_severity": 0.0,
                "baseline_risk": round(float(avg_baseline * 0.3), 3),
            }
        }

    # Compute component scores
    supply_score = _compute_category_score(news_signals, "supply_disruption")
    demand_score = _compute_category_score(news_signals, "demand_spike")
    severity_score = _compute_severity_score(news_signals)

    # Weighted aggregate
    raw_score = (
        WEIGHT_SUPPLY_DISRUPTION * supply_score +
        WEIGHT_DEMAND_SPIKE * demand_score +
        WEIGHT_NEWS_SEVERITY * severity_score
    )

    # Blend with baseline
    avg_baseline = np.mean(list(baseline.values())) if baseline else 0.0
    blended = 0.7 * raw_score + 0.3 * avg_baseline

    # Clamp to [0, 1]
    final_score = float(np.clip(blended, 0.0, 1.0))

    return {
        "risk_score": round(final_score, 3),
        "risk_level": classify_risk(final_score),
        "component_scores": {
            "supply_disruption": round(supply_score, 3),
            "demand_spike": round(demand_score, 3),
            "news_severity": round(severity_score, 3),
            "baseline_risk": round(float(avg_baseline), 3),
        }
    }


def classify_risk(score: float) -> str:
    """Classify numeric risk into High/Medium/Low."""
    if score >= HIGH_RISK_THRESHOLD:
        return "High"
    elif score >= MEDIUM_RISK_THRESHOLD:
        return "Medium"
    else:
        return "Low"


def _compute_category_score(signals: list, category: str) -> float:
    """Compute average severity for signals matching a category."""
    matching = [s["severity"] for s in signals if s.get("category") == category]
    if not matching:
        return 0.0
    return float(np.mean(matching))


def _compute_severity_score(signals: list) -> float:
    """Compute overall news severity from all signals."""
    if not signals:
        return 0.0
    severities = [s["severity"] for s in signals]
    # Use a combination of mean and max to capture both breadth and peak severity
    mean_sev = np.mean(severities)
    max_sev = max(severities)
    return float(0.6 * mean_sev + 0.4 * max_sev)
