"""CivicShield ML — Shortage Predictor

Predicts resource shortage probabilities for each resource type
(LPG, Fuel, Food, Water, Medicine) per state.
"""
import numpy as np
from ..utils.constants import RESOURCE_TYPES, RESOURCE_KEYWORDS


def predict_shortages(news_signals: list, baseline: dict) -> list:
    """
    Predict shortage probabilities for all resource types.

    Args:
        news_signals: List of signal dicts with headline, category, severity
        baseline: Dict of resource baseline shortage probabilities

    Returns:
        List of shortage prediction dicts
    """
    predictions = []

    for resource in RESOURCE_TYPES:
        base_prob = baseline.get(resource, 0.1)
        signal_boost = _compute_signal_boost(news_signals, resource)

        # Blend baseline with signal boost
        probability = float(np.clip(0.4 * base_prob + 0.6 * signal_boost, 0.0, 1.0))

        # If no signal boost, rely more on baseline
        if signal_boost == 0:
            probability = base_prob

        # Determine trend based on signal count and severity
        trend = _determine_trend(news_signals, resource, base_prob)

        predictions.append({
            "resource": resource,
            "resource_label": resource.upper() if resource in ["lpg"] else resource.capitalize(),
            "probability": round(probability, 3),
            "trend": trend,
            "severity": _classify_shortage(probability),
            "signal_count": _count_matching_signals(news_signals, resource),
        })

    return sorted(predictions, key=lambda x: x["probability"], reverse=True)


def _compute_signal_boost(signals: list, resource: str) -> float:
    """Compute signal boost for a specific resource based on keyword matching."""
    if not signals:
        return 0.0

    keywords = RESOURCE_KEYWORDS.get(resource, [])
    matching_severities = []

    for signal in signals:
        headline = signal.get("headline", "").lower()
        if any(kw in headline for kw in keywords):
            matching_severities.append(signal.get("severity", 0.5))
        elif signal.get("category") in ["supply_disruption", "natural_disaster"]:
            # General disruptions affect all resources to some degree
            matching_severities.append(signal.get("severity", 0.5) * 0.3)

    if not matching_severities:
        return 0.0

    return float(np.mean(matching_severities))


def _count_matching_signals(signals: list, resource: str) -> int:
    """Count how many signals mention this resource."""
    keywords = RESOURCE_KEYWORDS.get(resource, [])
    count = 0
    for signal in signals:
        headline = signal.get("headline", "").lower()
        if any(kw in headline for kw in keywords):
            count += 1
    return count


def _determine_trend(signals: list, resource: str, baseline: float) -> str:
    """Determine if shortage trend is rising, stable, or falling."""
    signal_count = _count_matching_signals(signals, resource)
    if signal_count >= 2:
        return "rising"
    elif signal_count == 1:
        return "rising" if baseline > 0.5 else "stable"
    elif baseline > 0.4:
        return "stable"
    else:
        return "stable"


def _classify_shortage(probability: float) -> str:
    """Classify shortage probability into severity levels."""
    if probability >= 0.7:
        return "critical"
    elif probability >= 0.4:
        return "warning"
    else:
        return "normal"
