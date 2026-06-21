"""
Pure, deterministic carbon footprint calculator.

All functions are side-effect-free: same inputs always produce the same output.
No I/O, no randomness, no external calls. Testable in isolation.

Sources cited inline — every constant traces to a published dataset.
"""
from __future__ import annotations

from app.emission_factors import (
    ELECTRICITY_FACTOR_KG_CO2_PER_KWH,
    ELECTRICITY_BILL_TO_KWH,
    LPG_KG_CO2_PER_CYLINDER,
    TRANSPORT_FACTORS,
    DIET_FACTORS_KG_CO2E_PER_DAY,
)
from app.models import CalculateRequest, CalculateResponse

_INDIA_AVERAGE_T = 1.84   # t CO2e/yr — India GHG Inventory 2016
_PARIS_TARGET_T  = 2.5    # t CO2e/yr — IPCC SR1.5, per-capita budget


def calculate_electricity(monthly_bill_inr: float, household_size: int = 1) -> float:
    """Convert INR electricity bill to annual kgCO2e, split by household size."""
    if monthly_bill_inr <= 0:
        return 0.0
    kwh_annual = monthly_bill_inr * ELECTRICITY_BILL_TO_KWH * 12
    return round((kwh_annual / household_size) * ELECTRICITY_FACTOR_KG_CO2_PER_KWH, 2)


def calculate_lpg(cylinders_per_month: float, household_size: int = 1) -> float:
    """Annual kgCO2e from LPG usage, split by household size. Source: IPCC 2006."""
    if cylinders_per_month <= 0:
        return 0.0
    annual = cylinders_per_month * 12 * LPG_KG_CO2_PER_CYLINDER
    return round(annual / household_size, 2)


def calculate_transport(mode: str, daily_km: float, days_per_week: int = 5) -> float:
    """Annual kgCO2e from commuting (round-trip). Source: India GHG Program v1.0."""
    if mode not in TRANSPORT_FACTORS or daily_km <= 0:
        return 0.0
    annual_km = daily_km * 2 * days_per_week * 52
    return round(annual_km * TRANSPORT_FACTORS[mode], 2)


def calculate_diet(diet_type: str) -> float:
    """Annual kgCO2e from diet. Source: Pathak et al. 2010, ICAR-IARI."""
    factor = DIET_FACTORS_KG_CO2E_PER_DAY.get(diet_type, 0.0)
    return round(factor * 365, 2)


def _score_level(total_t: float) -> str:
    if total_t <= 0.8:  return "excellent"
    if total_t <= 1.2:  return "good"
    if total_t <= 1.84: return "moderate"
    if total_t <= 2.5:  return "high"
    return "critical"


def calculate_total_footprint(req: CalculateRequest) -> CalculateResponse:
    """Aggregate all emission categories into a typed response."""
    elec_kg  = calculate_electricity(req.monthly_electricity_bill_inr, req.household_size)
    lpg_kg   = calculate_lpg(req.lpg_cylinders_per_month, req.household_size)
    trans_kg = calculate_transport(req.commute_mode, req.daily_commute_km, req.commute_days_per_week)
    diet_kg  = calculate_diet(req.diet_type)

    total_kg = elec_kg + lpg_kg + trans_kg + diet_kg
    total_t  = round(total_kg / 1000, 3)

    return CalculateResponse(
        annual_total_tco2e=total_t,
        annual_total_kgco2e=total_kg,
        breakdown={
            "electricity_kg": elec_kg,
            "lpg_kg":         lpg_kg,
            "transport_kg":   trans_kg,
            "diet_kg":        diet_kg,
        },
        india_average_t=_INDIA_AVERAGE_T,
        paris_target_t=_PARIS_TARGET_T,
        is_below_paris_target=total_t <= _PARIS_TARGET_T,
        score_level=_score_level(total_t),
    )
