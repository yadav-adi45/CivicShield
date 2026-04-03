"""CivicShield — Data Fetcher Service

Handles fetching crisis-related news data. Uses seed data as fallback
when News API key is not configured.
"""
import json
import os
import httpx
from pathlib import Path
from ..utils.config import NEWS_API_KEY, NEWS_API_BASE
from ..utils.constants import INDIAN_STATES


# Cache for fetched data
_cached_data = None
_seed_data = None


def get_seed_data() -> list:
    """Load seed crisis data from JSON file."""
    global _seed_data
    if _seed_data is None:
        seed_path = Path(__file__).parent.parent.parent / "data" / "seed_crisis_data.json"
        with open(seed_path, "r") as f:
            _seed_data = json.load(f)
    return _seed_data


async def fetch_crisis_data() -> list:
    """
    Fetch crisis data from News API or fall back to seed data.

    Returns:
        List of state data dicts with news_signals and baseline
    """
    global _cached_data

    if not NEWS_API_KEY:
        # No API key configured — use seed data
        return get_seed_data()

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                NEWS_API_BASE,
                params={
                    "q": "(shortage OR crisis OR flood OR earthquake OR cyclone OR drought OR blockade) AND India",
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 100,
                    "apiKey": NEWS_API_KEY,
                },
            )
            response.raise_for_status()
            articles = response.json().get("articles", [])

            # Process articles into state signals
            processed = _process_articles(articles)
            _cached_data = processed
            return processed

    except Exception as e:
        print(f"[DataFetcher] Error fetching from News API: {e}")
        if _cached_data:
            return _cached_data
        return get_seed_data()


def _process_articles(articles: list) -> list:
    """Process raw news articles into state-structured crisis data."""
    from .crisis_filter import extract_state_signals

    seed = get_seed_data()
    state_map = {item["code"]: item.copy() for item in seed}

    # Merge live signals with baselines from seed data
    live_signals = extract_state_signals(articles)

    for code, signals in live_signals.items():
        if code in state_map:
            state_map[code]["news_signals"] = signals
        else:
            state_name = INDIAN_STATES.get(code, code)
            state_map[code] = {
                "state": state_name,
                "code": code,
                "news_signals": signals,
                "baseline": {"lpg": 0.2, "fuel": 0.2, "food": 0.2, "water": 0.2, "medicine": 0.2}
            }

    return list(state_map.values())
