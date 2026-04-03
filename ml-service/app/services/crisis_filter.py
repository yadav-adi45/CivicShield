"""CivicShield — Crisis Filter

Filters and categorizes news articles by state and crisis type.
"""
from ..utils.constants import INDIAN_STATES, CRISIS_KEYWORDS


def extract_state_signals(articles: list) -> dict:
    """
    Extract structured crisis signals from raw news articles,
    organized by state code.

    Args:
        articles: List of raw article dicts from News API

    Returns:
        Dict mapping state codes to lists of signal dicts
    """
    state_signals = {}

    for article in articles:
        title = article.get("title", "") or ""
        description = article.get("description", "") or ""
        text = f"{title} {description}".lower()

        # Identify which states this article mentions
        mentioned_states = _extract_states(text)
        if not mentioned_states:
            continue

        # Categorize the crisis type
        category = _categorize_crisis(text)
        severity = _compute_article_severity(text, category)

        signal = {
            "headline": title,
            "category": category,
            "severity": round(severity, 2),
            "source": article.get("source", {}).get("name", "Unknown"),
            "date": (article.get("publishedAt", "")[:10] if article.get("publishedAt") else ""),
        }

        for state_code in mentioned_states:
            if state_code not in state_signals:
                state_signals[state_code] = []
            state_signals[state_code].append(signal)

    return state_signals


def _extract_states(text: str) -> list:
    """Find state mentions in text. Returns list of state codes."""
    found = []
    text_lower = text.lower()

    # Map common abbreviations and alternate names
    aliases = {
        "j&k": "JK", "jammu": "JK", "kashmir": "JK",
        "delhi": "DL", "ncr": "DL",
        "bengaluru": "KA", "bangalore": "KA",
        "chennai": "TN", "mumbai": "MH",
        "kolkata": "WB", "calcutta": "WB",
        "hyderabad": "TG", "ahmedabad": "GJ",
        "lucknow": "UP", "jaipur": "RJ",
        "imphal": "MN", "ludhiana": "PB",
        "shimla": "HP", "bhopal": "MP",
        "chandigarh": "CH", "puducherry": "PY",
        "pondicherry": "PY",
    }

    for alias, code in aliases.items():
        if alias in text_lower and code not in found:
            found.append(code)

    for code, name in INDIAN_STATES.items():
        if name.lower() in text_lower and code not in found:
            found.append(code)

    return found


def _categorize_crisis(text: str) -> str:
    """Determine the primary crisis category of text."""
    scores = {}
    for category, keywords in CRISIS_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        scores[category] = score

    if max(scores.values()) == 0:
        return "supply_disruption"  # default

    return max(scores, key=scores.get)


def _compute_article_severity(text: str, category: str) -> float:
    """Compute severity score for an article based on keyword density."""
    keywords = CRISIS_KEYWORDS.get(category, [])
    all_keywords = [kw for kws in CRISIS_KEYWORDS.values() for kw in kws]

    # Count matching keywords
    category_matches = sum(1 for kw in keywords if kw in text)
    total_matches = sum(1 for kw in all_keywords if kw in text)

    # Base severity from keyword density
    base = min(category_matches / max(len(keywords) * 0.3, 1), 1.0)

    # Boost from cross-category signals
    cross_boost = min(total_matches * 0.05, 0.2)

    return min(base + cross_boost, 1.0)
