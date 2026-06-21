"""
Gemini-powered insight generation with deterministic fallback.

Design rules:
  A1 — Gemini interprets pre-calculated numbers. Never computes emission factors.
  E2 — Fail gracefully: always returns rule-based fallback if Gemini fails or is disabled.
  A5 — Every response tagged with source: "gemini" or "rules".
"""
from __future__ import annotations

import json
import logging

from app.calculator import calculate_total_footprint
from app.config import Settings
from app.insights.rules import generate_rule_based_insights
from app.models import CalculateRequest, InsightsResponse, Recommendation

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are VaayuMitra — India's AI carbon footprint companion.

Your role: interpret pre-calculated carbon data and give India-specific, quantified recommendations.
You NEVER compute emission factors yourself. Numbers come from the deterministic calculator.

Persona rules:
- Celebratory first: India's average (1.84 t/yr) is already far below global average (4.7 t/yr). Frame this positively.
- Quantify everything: "saves 4.2 kg CO₂/month" not "reduces emissions"
- India reference points: compare to Mumbai-Pune trips, LPG cylinders, tree equivalents
- Source every recommendation: cite India GHG Program, CEA, Pathak et al.
- Respond in Hinglish if the user writes in Hindi or Hinglish
- Action-first: end each recommendation with one specific next step

Output format (JSON object):
{
  "summary": "2-sentence summary of their footprint",
  "recommendations": [
    {
      "title": "Short actionable title",
      "description": "2-3 sentence explanation with numbers and India context",
      "category": "transport|electricity|lpg|diet",
      "monthly_saving_kg": <number>,
      "difficulty": "easy|medium|hard",
      "source": "gemini",
      "source_citation": "Source name"
    }
  ]
}

Return ONLY valid JSON. No markdown fences. No extra text."""


def _build_prompt(req: CalculateRequest, result: CalculateResponse) -> str:
    bd = result.breakdown
    return f"""User lifestyle profile (pre-calculated by deterministic engine):
- City: {req.city}
- Household size: {req.household_size} people
- Primary commute: {req.commute_mode}, {req.daily_commute_km} km each way, {req.commute_days_per_week} days/week
- Monthly electricity bill: ₹{req.monthly_electricity_bill_inr}
- LPG usage: {req.lpg_cylinders_per_month} cylinders/month
- Diet: {req.diet_type}

Calculated footprint:
- Electricity: {bd.get('electricity_kg', 0):.1f} kg CO₂e/yr
- LPG: {bd.get('lpg_kg', 0):.1f} kg CO₂e/yr
- Transport: {bd.get('transport_kg', 0):.1f} kg CO₂e/yr
- Diet: {bd.get('diet_kg', 0):.1f} kg CO₂e/yr
- Total: {result.annual_total_kgco2e:.1f} kg CO₂e/yr ({result.annual_total_tco2e:.2f} t)

India average: {result.india_average_t} t/yr | Paris target: {result.paris_target_t} t/yr

Generate 2-3 personalized carbon reduction recommendations for this Indian user.
Focus on their highest-impact categories first. Be specific with numbers."""


def get_ai_insights(req: CalculateRequest, settings: Settings) -> InsightsResponse:
    """
    Call Gemini API for personalized carbon insights.
    Falls back to rule-based insights if Gemini is disabled or fails.
    """
    result = calculate_total_footprint(req)

    if not settings.use_gemini:
        return generate_rule_based_insights(req, result)

    api_key = settings.gemini_api_key
    if not api_key:
        return generate_rule_based_insights(req, result)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        user_msg = _build_prompt(req, result)

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=user_msg,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3,
                max_output_tokens=2048,
            ),
        )

        raw = response.text.strip()
        # Strip markdown fences Gemini sometimes adds despite instructions
        if raw.startswith("```"):
            raw = raw.split("```", 2)[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rsplit("```", 1)[0].strip()
        parsed = json.loads(raw)
        recs = [Recommendation(**r) for r in parsed.get("recommendations", [])[:3]]
        return InsightsResponse(
            recommendations=recs,
            source="gemini",
            summary=parsed.get("summary"),
        )

    except Exception as exc:
        logger.warning("Gemini insights error — falling back to rules: %s", exc)
        return generate_rule_based_insights(req, result)
