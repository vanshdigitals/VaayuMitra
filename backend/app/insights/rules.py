"""
Deterministic, personalised rule engine for VaayuMitra.

Strategy: rank the user's emission categories by size and emit targeted actions
for the biggest contributors, each with a quantified annual saving estimate based
on the user's *actual* input data — not generic placeholders.
"""
from __future__ import annotations

from app.emission_factors import (
    TRANSPORT_FACTORS,
    DIET_FACTORS_KG_CO2E_PER_DAY,
    ELECTRICITY_FACTOR_KG_CO2_PER_KWH,
    ELECTRICITY_BILL_TO_KWH,
)
from app.models import CalculateRequest, CalculateResponse, InsightsResponse, Recommendation

# Conservative reduction shares used for saving estimates
_METRO_DAYS_PER_WEEK = 2          # suggest 2 metro days
_AC_REDUCTION_HOURS_PER_DAY = 1   # 1.5T AC uses ~1.5 kWh/hr
_AC_WATTS_PER_HOUR = 1.5          # kWh
_ELEC_REDUCTION_SHARE = 0.15      # renewable + behaviour saves ~15%
_LPG_REDUCTION_SHARE = 0.20       # pressure cooker + habits save ~20%

# Diet ladder — ordered from highest to lowest footprint
_DIET_LADDER = ["frequent_non_veg", "non_veg", "mostly_veg", "veg"]


def _transport_recommendation(req: CalculateRequest, transport_kg: float) -> Recommendation | None:
    if transport_kg <= 0:
        return None

    mode = req.commute_mode
    km = req.daily_commute_km
    days = req.commute_days_per_week

    # Specific advice: switch petrol modes to metro
    if mode in ("2_wheeler_petrol", "car_petrol", "auto_cng") and km > 0:
        annual_km = km * 2 * days * 52
        current_factor = TRANSPORT_FACTORS[mode]
        metro_factor = TRANSPORT_FACTORS["metro"]
        metro_days = min(_METRO_DAYS_PER_WEEK, days)
        switch_fraction = metro_days / max(days, 1)
        saving_kg = annual_km * switch_fraction * (current_factor - metro_factor)
        saving_monthly = round(saving_kg / 12, 1)

        mode_label = {"2_wheeler_petrol": "two-wheeler", "car_petrol": "car", "auto_cng": "auto"}[mode]
        return Recommendation(
            title=f"Switch {mode_label} to Metro {metro_days} days/week",
            description=(
                f"Metro emits {metro_factor} kgCO₂/km vs your {mode_label} at {current_factor} kgCO₂/km. "
                f"Switching {metro_days} days/week saves ~{saving_monthly} kg CO₂/month — "
                f"equivalent to {round(saving_monthly / 0.108, 0):.0f} CNG auto trips."
            ),
            category="transport",
            monthly_saving_kg=saving_monthly,
            difficulty="easy",
            source="rules",
            source_citation="India GHG Program v1.0, WRI/TERI/CII 2015",
        )

    # Generic advice for bus/walk (already low-emission)
    if transport_kg > 0:
        saving_monthly = round(transport_kg * 0.10 / 12, 1)
        return Recommendation(
            title="Consolidate trips and carpool when possible",
            description=(
                "Even low-emission modes add up. Combining errands and carpooling "
                f"can save ~{saving_monthly} kg CO₂/month with no lifestyle sacrifice."
            ),
            category="transport",
            monthly_saving_kg=saving_monthly,
            difficulty="easy",
            source="rules",
            source_citation="India GHG Program v1.0",
        )
    return None


def _electricity_recommendation(req: CalculateRequest, elec_kg: float) -> Recommendation | None:
    if elec_kg <= 0:
        return None

    # AC reduction tip
    kwh_monthly = req.monthly_electricity_bill_inr * ELECTRICITY_BILL_TO_KWH
    ac_saving_kwh_monthly = _AC_WATTS_PER_HOUR * _AC_REDUCTION_HOURS_PER_DAY * 30
    if kwh_monthly > 0 and ac_saving_kwh_monthly / kwh_monthly > 0.05:
        ac_kg_monthly = round(ac_saving_kwh_monthly * ELECTRICITY_FACTOR_KG_CO2_PER_KWH, 1)
        inr_saved = round(ac_saving_kwh_monthly * 6.5, 0)
        return Recommendation(
            title="Reduce AC usage by 1 hour per day",
            description=(
                f"A 1.5-tonne AC uses ~1.5 kWh/hr. Cutting 1 hr/day saves ~{ac_kg_monthly} kg CO₂/month "
                f"and ₹{inr_saved:.0f}/month on your electricity bill (CEA grid factor: 0.71 kgCO₂/kWh)."
            ),
            category="electricity",
            monthly_saving_kg=ac_kg_monthly,
            difficulty="easy",
            source="rules",
            source_citation="CEA CO₂ Baseline Database v21.0, FY2024-25",
        )

    # Generic renewable tariff tip
    saving_monthly = round(elec_kg * _ELEC_REDUCTION_SHARE / 12, 1)
    return Recommendation(
        title="Switch to a green electricity tariff",
        description=(
            f"India's grid emits 0.71 kgCO₂/kWh (CEA v21.0). Switching to a renewable tariff "
            f"can save ~{saving_monthly} kg CO₂/month at no extra cost in many cities."
        ),
        category="electricity",
        monthly_saving_kg=saving_monthly,
        difficulty="medium",
        source="rules",
        source_citation="CEA CO₂ Baseline Database v21.0, FY2024-25",
    )


def _lpg_recommendation(req: CalculateRequest, lpg_kg: float) -> Recommendation | None:
    if lpg_kg <= 0:
        return None

    saving_monthly = round(lpg_kg * _LPG_REDUCTION_SHARE / 12, 1)
    return Recommendation(
        title="Use a pressure cooker and solar cooker for meals",
        description=(
            f"Pressure cookers reduce cooking time by up to 70%. Combined with a solar cooker "
            f"for daytime meals, you can save ~{saving_monthly} kg CO₂/month "
            f"({round(req.lpg_cylinders_per_month * 12 * _LPG_REDUCTION_SHARE * 0.2, 1)} cylinders/yr less)."
        ),
        category="lpg",
        monthly_saving_kg=saving_monthly,
        difficulty="medium",
        source="rules",
        source_citation="IPCC 2006 Guidelines, Vol. 2, Ch. 2",
    )


def _diet_recommendation(req: CalculateRequest, diet_kg: float) -> Recommendation | None:
    current = req.diet_type
    idx = _DIET_LADDER.index(current) if current in _DIET_LADDER else -1

    if idx < 0 or idx >= len(_DIET_LADDER) - 1:
        # Already veg — no greener suggestion
        return None

    next_diet = _DIET_LADDER[idx + 1]
    current_daily = DIET_FACTORS_KG_CO2E_PER_DAY[current]
    next_daily = DIET_FACTORS_KG_CO2E_PER_DAY.get(next_diet, current_daily)
    saving_annual = round((current_daily - next_daily) * 365, 1)
    saving_monthly = round(saving_annual / 12, 1)

    label_map = {
        "frequent_non_veg": "frequent non-vegetarian",
        "non_veg": "non-vegetarian",
        "mostly_veg": "mostly vegetarian",
    }
    next_label = label_map.get(next_diet, next_diet.replace("_", " "))

    return Recommendation(
        title=f"Add 2 vegetarian days per week",
        description=(
            f"Shifting from {label_map.get(current, current)} to {next_label} saves "
            f"~{saving_monthly} kg CO₂/month ({saving_annual} kg/yr). "
            f"A vegetarian thali emits {next_daily} kgCO₂e vs {current_daily} kgCO₂e/day. "
            "Equivalent to planting trees each year."
        ),
        category="diet",
        monthly_saving_kg=saving_monthly,
        difficulty="medium",
        source="rules",
        source_citation="Pathak et al. 2010, ICAR-IARI",
    )


def generate_rule_based_insights(
    req: CalculateRequest,
    result: CalculateResponse,
) -> InsightsResponse:
    """Produce ranked, quantified recommendations from the user's actual footprint breakdown."""
    breakdown = result.breakdown

    # Map calculator keys to handler functions
    handlers = {
        "electricity_kg": lambda kg: _electricity_recommendation(req, kg),
        "lpg_kg":         lambda kg: _lpg_recommendation(req, kg),
        "transport_kg":   lambda kg: _transport_recommendation(req, kg),
        "diet_kg":        lambda kg: _diet_recommendation(req, kg),
    }

    # Rank categories by actual emission size (largest first)
    ranked = sorted(breakdown.items(), key=lambda kv: kv[1], reverse=True)

    recommendations: list[Recommendation] = []
    for category, amount in ranked:
        handler = handlers.get(category)
        if handler:
            rec = handler(amount)
            if rec is not None:
                recommendations.append(rec)

    total_t = result.annual_total_tco2e
    target_t = result.paris_target_t
    india_avg = result.india_average_t

    if total_t <= target_t:
        summary = (
            f"Your footprint is {total_t:.2f} t CO₂e/yr — below the Paris 1.5°C target "
            f"of {target_t} t. You're already well below the India average of {india_avg} t."
        )
    else:
        over = round(total_t - target_t, 2)
        summary = (
            f"Your footprint is {total_t:.2f} t CO₂e/yr — {over} t above the Paris target "
            f"of {target_t} t. India's average is {india_avg} t. "
            "The actions below target your biggest sources first."
        )

    return InsightsResponse(
        recommendations=recommendations[:4],
        source="rules",
        summary=summary,
    )
