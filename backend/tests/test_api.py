"""Integration tests for all API routes."""
from __future__ import annotations

import pytest

# ─── /api/health ─────────────────────────────────────────────────────────────

def test_health_ok(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "version" in body


# ─── Security headers ─────────────────────────────────────────────────────────

def test_security_headers_present(client):
    res = client.get("/api/health")
    assert res.headers["X-Content-Type-Options"] == "nosniff"
    assert res.headers["X-Frame-Options"] == "DENY"
    assert "Content-Security-Policy" in res.headers


# ─── /api/calculate ──────────────────────────────────────────────────────────

_VALID_PAYLOAD = {
    "city": "Mumbai",
    "household_size": 2,
    "monthly_electricity_bill_inr": 2000,
    "lpg_cylinders_per_month": 1,
    "commute_mode": "metro",
    "daily_commute_km": 15,
    "commute_days_per_week": 5,
    "diet_type": "veg",
}


def test_calculate_returns_breakdown(client):
    res = client.post("/api/calculate", json=_VALID_PAYLOAD)
    assert res.status_code == 200
    body = res.json()
    assert "annual_total_tco2e" in body
    assert "breakdown" in body
    assert body["annual_total_tco2e"] > 0


def test_calculate_breakdown_sums_to_total(client):
    res = client.post("/api/calculate", json=_VALID_PAYLOAD)
    body = res.json()
    total_from_breakdown = sum(body["breakdown"].values())
    assert abs(body["annual_total_kgco2e"] - total_from_breakdown) < 0.01


def test_calculate_invalid_commute_mode(client):
    payload = {**_VALID_PAYLOAD, "commute_mode": "spaceship"}
    res = client.post("/api/calculate", json=payload)
    assert res.status_code == 422


def test_calculate_negative_electricity_rejected(client):
    payload = {**_VALID_PAYLOAD, "monthly_electricity_bill_inr": -100}
    res = client.post("/api/calculate", json=payload)
    assert res.status_code == 422


def test_calculate_household_zero_rejected(client):
    payload = {**_VALID_PAYLOAD, "household_size": 0}
    res = client.post("/api/calculate", json=payload)
    assert res.status_code == 422


def test_calculate_commute_km_too_high_rejected(client):
    payload = {**_VALID_PAYLOAD, "daily_commute_km": 600}
    res = client.post("/api/calculate", json=payload)
    assert res.status_code == 422


# ─── /api/insights ───────────────────────────────────────────────────────────

def test_insights_returns_rule_based_when_gemini_disabled(client):
    res = client.post("/api/insights", json=_VALID_PAYLOAD)
    assert res.status_code == 200
    body = res.json()
    assert body["source"] == "rules"
    assert isinstance(body["recommendations"], list)
    assert len(body["recommendations"]) > 0


def test_insights_recommendations_have_required_fields(client):
    res = client.post("/api/insights", json=_VALID_PAYLOAD)
    rec = res.json()["recommendations"][0]
    required = {"title", "description", "category", "monthly_saving_kg", "difficulty"}
    assert required.issubset(rec.keys())


def test_insights_high_car_user_gets_transport_recommendation(client):
    car_user = {
        **_VALID_PAYLOAD,
        "commute_mode": "car_petrol",
        "daily_commute_km": 40,
        "monthly_electricity_bill_inr": 500,
        "lpg_cylinders_per_month": 0.5,
        "diet_type": "veg",
    }
    res = client.post("/api/insights", json=car_user)
    recs = res.json()["recommendations"]
    categories = [r["category"] for r in recs]
    assert "transport" in categories


def test_insights_has_summary(client):
    res = client.post("/api/insights", json=_VALID_PAYLOAD)
    body = res.json()
    assert "summary" in body
    assert isinstance(body["summary"], str)
    assert len(body["summary"]) > 0


# ─── /api/entries ────────────────────────────────────────────────────────────

def _make_entry_payload(device_id: str = "vm-test-device-001") -> dict:
    return {
        "device_id": device_id,
        "profile": _VALID_PAYLOAD,
        "result": {
            "annual_total_tco2e": 1.45,
            "annual_total_kgco2e": 1450.0,
            "breakdown": {
                "electricity_kg": 400.0,
                "lpg_kg": 250.0,
                "transport_kg": 450.0,
                "diet_kg": 350.0,
            },
            "india_average_t": 1.84,
            "paris_target_t": 2.5,
            "is_below_paris_target": True,
            "score_level": "moderate",
        },
    }


def test_create_entry_returns_201(client):
    res = client.post("/api/entries", json=_make_entry_payload())
    assert res.status_code == 201
    body = res.json()
    assert "id" in body
    assert "created_at" in body


def test_list_entries_empty_initially(client):
    res = client.get("/api/entries/vm-fresh-device-99")
    assert res.status_code == 200
    assert res.json() == []


def test_list_entries_after_create(client):
    device = "vm-round-trip-device"
    client.post("/api/entries", json=_make_entry_payload(device))
    res = client.get(f"/api/entries/{device}")
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_entry_device_id_too_short_rejected(client):
    payload = _make_entry_payload()
    payload["device_id"] = "ab"
    res = client.post("/api/entries", json=payload)
    assert res.status_code == 422


def test_list_entries_invalid_device_id_pattern(client):
    res = client.get("/api/entries/bad device id!")
    assert res.status_code == 422


# ─── Unknown routes ───────────────────────────────────────────────────────────

def test_unknown_route_returns_404(client):
    res = client.get("/api/nonexistent")
    assert res.status_code == 404
