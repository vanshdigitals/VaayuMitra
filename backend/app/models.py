from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


# ─── Input models ─────────────────────────────────────────────────────────────

class CalculateRequest(BaseModel):
    city: str = Field(min_length=1, max_length=100)
    household_size: int = Field(default=1, ge=1, le=20)
    monthly_electricity_bill_inr: float = Field(default=0.0, ge=0, le=100_000)
    lpg_cylinders_per_month: float = Field(default=0.0, ge=0, le=10)
    commute_mode: Literal[
        "2_wheeler_petrol", "car_petrol", "auto_cng",
        "city_bus", "metro", "walk_cycle",
    ] = "walk_cycle"
    daily_commute_km: float = Field(default=0.0, ge=0, le=500)
    commute_days_per_week: int = Field(default=5, ge=0, le=7)
    diet_type: Literal["veg", "mostly_veg", "non_veg", "frequent_non_veg"] = "veg"
    device_id: Optional[str] = Field(default=None, max_length=200)


class ChatRequest(BaseModel):
    profile: CalculateRequest
    messages: list[dict[str, str]]


# ─── Response models ───────────────────────────────────────────────────────────

class CalculateResponse(BaseModel):
    annual_total_tco2e: float
    annual_total_kgco2e: float
    breakdown: dict[str, float]
    india_average_t: float
    paris_target_t: float
    is_below_paris_target: bool
    score_level: str


class Recommendation(BaseModel):
    title: str
    description: str
    category: str
    monthly_saving_kg: float
    difficulty: Literal["easy", "medium", "hard"]
    source: str
    source_citation: str


class InsightsResponse(BaseModel):
    recommendations: list[Recommendation]
    source: Literal["gemini", "rules"]
    summary: Optional[str] = None


# ─── Entry models ──────────────────────────────────────────────────────────────

class EntryCreate(BaseModel):
    device_id: str = Field(min_length=4, max_length=200)
    profile: CalculateRequest
    result: CalculateResponse


class Entry(BaseModel):
    id: str
    device_id: str
    created_at: datetime
    profile: CalculateRequest
    result: CalculateResponse
