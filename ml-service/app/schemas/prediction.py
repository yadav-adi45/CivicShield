"""CivicShield — Pydantic Schemas for Prediction Endpoints"""
from pydantic import BaseModel
from typing import List, Optional


class ComponentScores(BaseModel):
    supply_disruption: float
    demand_spike: float
    news_severity: float
    baseline_risk: float


class RiskData(BaseModel):
    risk_score: float
    risk_level: str
    component_scores: ComponentScores


class ShortageItem(BaseModel):
    resource: str
    resource_label: str
    probability: float
    trend: str
    severity: str
    signal_count: int


class NewsSignal(BaseModel):
    headline: str
    category: str
    severity: float
    source: str
    date: str


class ContributingFactor(BaseModel):
    factor: str
    detail: str
    impact: str


class ActionItem(BaseModel):
    resource: str
    recommendation: str
    urgency: str


class Confidence(BaseModel):
    level: str
    signal_count: int
    explanation: str


class Explanation(BaseModel):
    summary: str
    contributing_factors: List[ContributingFactor]
    actions: List[ActionItem]
    confidence: Confidence


class StatePrediction(BaseModel):
    state: str
    code: str
    risk: RiskData
    shortages: List[ShortageItem]


class PredictionResponse(BaseModel):
    states: List[StatePrediction]
    last_updated: str
    total_high_risk: int
    total_medium_risk: int
    total_low_risk: int


class RegionDetailResponse(BaseModel):
    state: str
    code: str
    risk: RiskData
    shortages: List[ShortageItem]
    explanation: Explanation
    news_signals: List[NewsSignal]
    last_updated: str
