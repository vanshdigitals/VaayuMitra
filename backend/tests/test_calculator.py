"""Tests for the pure carbon calculator functions."""
from __future__ import annotations

import math

import pytest

from app.calculator import (
    calculate_diet,
    calculate_electricity,
    calculate_lpg,
    calculate_total_footprint,
    calculate_transport,
)
from app.models import CalculateRequest


# ─── calculate_electricity ────────────────────────────────────────────────────

def test_electricity_zero_bill():
    assert calculate_electricity(0) == 0.0
    assert calculate_electricity(-10) == 0.0


def test_electricity_scales_with_bill():
    result = calculate_electricity(1000)
    assert result > 0
    # ₹1000 / 6.5 ≈ 153.8 kWh/month × 12 × 0.71 ≈ 1309 kg/yr (household=1)
    assert 1200 < result < 1400


def test_electricity_split_by_household():
    single = calculate_electricity(2000, household_size=1)
    shared = calculate_electricity(2000, household_size=2)
    assert abs(single - shared * 2) < 0.1


# ─── calculate_lpg ───────────────────────────────────────────────────────────

def test_lpg_zero():
    assert calculate_lpg(0) == 0.0


def test_lpg_one_cylinder_per_month():
    result = calculate_lpg(1, household_size=1)
    # 12 cylinders × 42.36 kg/cylinder ≈ 508.32 kg/yr
    assert abs(result - 508.32) < 1.0


def test_lpg_split_by_household():
    single = calculate_lpg(1, household_size=1)
    shared = calculate_lpg(1, household_size=2)
    assert abs(single - shared * 2) < 0.1


# ─── calculate_transport ─────────────────────────────────────────────────────

def test_transport_walk_is_zero():
    assert calculate_transport("walk_cycle", 10, 5) == 0.0


def test_transport_zero_km_is_zero():
    assert calculate_transport("car_petrol", 0, 5) == 0.0


def test_transport_car_emits_more_than_metro():
    car = calculate_transport("car_petrol", 10, 5)
    metro = calculate_transport("metro", 10, 5)
    assert car > metro


def test_transport_two_wheeler_vs_car():
    bike = calculate_transport("2_wheeler_petrol", 10, 5)
    car = calculate_transport("car_petrol", 10, 5)
    # 0.04 vs 0.14 kg/km
    assert bike < car


def test_transport_annual_calculation():
    # car_petrol: 10 km/day × 2 × 5 days × 52 weeks × 0.140 kg/km
    expected = 10 * 2 * 5 * 52 * 0.140
    result = calculate_transport("car_petrol", 10, 5)
    assert abs(result - expected) < 0.5


# ─── calculate_diet ──────────────────────────────────────────────────────────

def test_diet_veg_less_than_non_veg():
    assert calculate_diet("veg") < calculate_diet("non_veg")


def test_diet_non_veg_less_than_frequent():
    assert calculate_diet("non_veg") < calculate_diet("frequent_non_veg")


def test_diet_unknown_returns_zero():
    assert calculate_diet("carnivore_supreme") == 0.0


def test_diet_veg_annual():
    # 0.72 kg/day × 365
    expected = round(0.72 * 365, 2)
    assert calculate_diet("veg") == expected


# ─── calculate_total_footprint ────────────────────────────────────────────────

def test_total_equals_sum_of_breakdown():
    req = CalculateRequest(
        city="Mumbai",
        household_size=2,
        monthly_electricity_bill_inr=1500,
        lpg_cylinders_per_month=1,
        commute_mode="metro",
        daily_commute_km=10,
        commute_days_per_week=5,
        diet_type="veg",
    )
    result = calculate_total_footprint(req)
    expected_total = sum(result.breakdown.values())
    assert abs(result.annual_total_kgco2e - expected_total) < 0.01


def test_total_footprint_returns_response_model():
    from app.models import CalculateResponse
    req = CalculateRequest(city="Delhi")
    result = calculate_total_footprint(req)
    assert isinstance(result, CalculateResponse)


def test_total_footprint_all_zero_inputs():
    req = CalculateRequest(city="Test", diet_type="veg")
    result = calculate_total_footprint(req)
    # Only diet contributes when everything else is zero
    assert result.annual_total_kgco2e == calculate_diet("veg")


def test_score_level_critical_above_target():
    req = CalculateRequest(
        city="Test",
        monthly_electricity_bill_inr=10000,
        lpg_cylinders_per_month=5,
        commute_mode="car_petrol",
        daily_commute_km=80,
        diet_type="frequent_non_veg",
    )
    result = calculate_total_footprint(req)
    assert result.score_level in ("high", "critical")


def test_result_values_are_finite():
    req = CalculateRequest(city="Bengaluru")
    result = calculate_total_footprint(req)
    assert math.isfinite(result.annual_total_kgco2e)
    assert math.isfinite(result.annual_total_tco2e)


def test_india_and_paris_constants_present():
    req = CalculateRequest(city="Test")
    result = calculate_total_footprint(req)
    assert result.india_average_t == 1.84
    assert result.paris_target_t == 2.5
