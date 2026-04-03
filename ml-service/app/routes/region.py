"""CivicShield — FastAPI Region Detail Route"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from ..services.data_fetcher import fetch_crisis_data
from ..models.risk_model import compute_risk_score
from ..models.shortage_predictor import predict_shortages
from ..services.explainer import generate_explanation
from ..schemas.prediction import RegionDetailResponse

router = APIRouter()


@router.get("/region/{state_code}", response_model=RegionDetailResponse)
async def get_region_detail(state_code: str):
    """
    Get detailed prediction for a specific state.
    Includes risk score, shortage predictions, explanation, and news signals.
    """
    state_code = state_code.upper()
    crisis_data = await fetch_crisis_data()

    # Find the state
    state_data = None
    for item in crisis_data:
        if item["code"] == state_code:
            state_data = item
            break

    if not state_data:
        raise HTTPException(status_code=404, detail=f"State code '{state_code}' not found")

    news_signals = state_data.get("news_signals", [])
    baseline = state_data.get("baseline", {})

    risk = compute_risk_score(news_signals, baseline)
    shortages = predict_shortages(news_signals, baseline)
    explanation = generate_explanation(
        state_data["state"], risk, shortages, news_signals
    )

    return RegionDetailResponse(
        state=state_data["state"],
        code=state_data["code"],
        risk=risk,
        shortages=shortages,
        explanation=explanation,
        news_signals=news_signals,
        last_updated=datetime.now(timezone.utc).isoformat(),
    )
