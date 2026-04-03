"""CivicShield — Explainer Service

Generates human-readable explanations for predictions.
"Why this prediction" — Explainable AI component.
"""
from ..utils.constants import ACTION_RECOMMENDATIONS


def generate_explanation(state_name: str, risk_data: dict, shortages: list, news_signals: list) -> dict:
    """
    Generate a human-readable explanation for a state's prediction.

    Returns:
        Dict with summary, contributing_factors, actions
    """
    risk_score = risk_data.get("risk_score", 0)
    risk_level = risk_data.get("risk_level", "Low")
    components = risk_data.get("component_scores", {})

    # Build contributing factors
    factors = []

    if news_signals:
        factors.append({
            "factor": "News Signal Volume",
            "detail": f"{len(news_signals)} crisis-related article(s) detected for {state_name}",
            "impact": "high" if len(news_signals) >= 3 else "medium" if len(news_signals) >= 1 else "low"
        })

    if components.get("supply_disruption", 0) > 0.3:
        supply_articles = [s for s in news_signals if s.get("category") == "supply_disruption"]
        factors.append({
            "factor": "Supply Chain Disruption",
            "detail": f"{len(supply_articles)} report(s) of supply disruption: " +
                      "; ".join([s["headline"][:60] for s in supply_articles[:2]]),
            "impact": "high" if components["supply_disruption"] > 0.6 else "medium"
        })

    if components.get("demand_spike", 0) > 0.3:
        demand_articles = [s for s in news_signals if s.get("category") == "demand_spike"]
        factors.append({
            "factor": "Demand Surge",
            "detail": f"{len(demand_articles)} report(s) of unusual demand: " +
                      "; ".join([s["headline"][:60] for s in demand_articles[:2]]),
            "impact": "high" if components["demand_spike"] > 0.6 else "medium"
        })

    if components.get("baseline_risk", 0) > 0.4:
        factors.append({
            "factor": "Historical Risk Pattern",
            "detail": f"{state_name} has elevated baseline risk ({components['baseline_risk']:.1%}) based on historical patterns",
            "impact": "medium"
        })

    # Natural disaster signals
    disaster_articles = [s for s in news_signals if s.get("category") == "natural_disaster"]
    if disaster_articles:
        factors.append({
            "factor": "Natural Disaster Alert",
            "detail": "; ".join([s["headline"][:60] for s in disaster_articles[:2]]),
            "impact": "high" if any(s["severity"] > 0.7 for s in disaster_articles) else "medium"
        })

    # Conflict signals
    conflict_articles = [s for s in news_signals if s.get("category") == "conflict"]
    if conflict_articles:
        factors.append({
            "factor": "Conflict / Civil Unrest",
            "detail": "; ".join([s["headline"][:60] for s in conflict_articles[:2]]),
            "impact": "high" if any(s["severity"] > 0.7 for s in conflict_articles) else "medium"
        })

    if not factors:
        factors.append({
            "factor": "Stable Conditions",
            "detail": f"No significant crisis signals detected for {state_name}",
            "impact": "low"
        })

    # Build action recommendations
    actions = []
    risk_key = risk_level.lower()
    for shortage in shortages[:3]:  # Top 3 shortages
        resource = shortage["resource"]
        rec = ACTION_RECOMMENDATIONS.get(resource, {}).get(risk_key, "")
        if rec and shortage["probability"] > 0.3:
            actions.append({
                "resource": shortage["resource_label"],
                "recommendation": rec,
                "urgency": shortage["severity"]
            })

    # Summary
    if risk_level == "High":
        summary = f"⚠️ {state_name} is at HIGH RISK (score: {risk_score:.0%}). Multiple crisis signals detected requiring immediate attention."
    elif risk_level == "Medium":
        summary = f"🔶 {state_name} is at MODERATE RISK (score: {risk_score:.0%}). Monitoring recommended for emerging crisis indicators."
    else:
        summary = f"🟢 {state_name} is at LOW RISK (score: {risk_score:.0%}). No significant crisis signals detected."

    return {
        "summary": summary,
        "contributing_factors": factors,
        "actions": actions,
        "confidence": _compute_confidence(news_signals, components),
    }


def _compute_confidence(signals: list, components: dict) -> dict:
    """Compute confidence level of the prediction."""
    signal_count = len(signals)

    if signal_count >= 5:
        level = "high"
        explanation = "Multiple corroborating signals from diverse sources"
    elif signal_count >= 2:
        level = "medium"
        explanation = "Some signals available but could benefit from more data"
    elif signal_count >= 1:
        level = "low"
        explanation = "Limited signal data; prediction based partially on baseline patterns"
    else:
        level = "very_low"
        explanation = "No live signals; prediction based entirely on historical baseline"

    return {
        "level": level,
        "signal_count": signal_count,
        "explanation": explanation,
    }
