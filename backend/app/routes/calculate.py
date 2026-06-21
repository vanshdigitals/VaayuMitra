"""Footprint calculation, insights, and chat endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.calculator import calculate_total_footprint
from app.chat.gemini import chat_with_gemini
from app.config import Settings, get_settings
from app.insights.gemini import get_ai_insights
from app.models import (
    CalculateRequest,
    CalculateResponse,
    ChatRequest,
    InsightsResponse,
)

router = APIRouter(prefix="/api", tags=["footprint"])


@router.post("/calculate", response_model=CalculateResponse)
def calculate(payload: CalculateRequest) -> CalculateResponse:
    """Compute the annual carbon footprint breakdown for the supplied inputs."""
    return calculate_total_footprint(payload)


@router.post("/insights", response_model=InsightsResponse)
def insights(
    payload: CalculateRequest,
    settings: Settings = Depends(get_settings),
) -> InsightsResponse:
    """Return personalized reduction advice (Gemini with deterministic fallback)."""
    return get_ai_insights(payload, settings)


@router.post("/chat")
def chat(
    payload: ChatRequest,
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    """Conversational endpoint — streams a single Gemini reply."""
    return {"text": chat_with_gemini(payload.profile, payload.messages, settings)}
