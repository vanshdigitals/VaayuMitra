"""
Gemini-powered conversational chat with graceful offline fallback.
"""
from __future__ import annotations

import logging

from app.config import Settings
from app.models import CalculateRequest

logger = logging.getLogger(__name__)

CHAT_SYSTEM_PROMPT = """You are VaayuMitra — India's AI carbon footprint companion.

Persona rules:
- You are friendly, encouraging, and deeply understand the Indian context.
- Keep responses short, concise, and highly actionable. No long essays.
- You can refer to the user's specific lifestyle data (provided below) to give personalized advice.
- If asked about Indian emission factors, cite the CEA (Central Electricity Authority) or India GHG Program.
- Respond in English, but you can use occasional Hinglish if the user does.
- Use simple formatting (bullet points, short paragraphs)."""

_OFFLINE_MESSAGE = (
    "I'm currently running in offline mode. "
    "Your dashboard shows rule-based insights based on your footprint. "
    "To enable AI chat, add your Gemini API key to the backend .env file."
)


def _build_context(req: CalculateRequest) -> str:
    return f"""User lifestyle profile:
- City: {req.city}
- Household size: {req.household_size} people
- Primary commute: {req.commute_mode}, {req.daily_commute_km} km each way
- Monthly electricity bill: ₹{req.monthly_electricity_bill_inr}
- LPG usage: {req.lpg_cylinders_per_month} cylinders/month
- Diet: {req.diet_type}"""


def chat_with_gemini(req: CalculateRequest, messages: list[dict[str, str]], settings: Settings) -> str:
    """
    Continue a conversation using Gemini. Returns the assistant's reply as a string.
    Falls back to an offline message if Gemini is disabled or the API call fails.
    """
    if not settings.use_gemini or not settings.gemini_api_key:
        return _OFFLINE_MESSAGE

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.gemini_api_key)
        full_system = f"{CHAT_SYSTEM_PROMPT}\n\nUSER PROFILE CONTEXT:\n{_build_context(req)}"

        formatted = [
            types.Content(
                role="user" if m["role"] == "user" else "model",
                parts=[types.Part.from_text(text=m["content"])],
            )
            for m in messages
        ]

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=formatted,
            config=types.GenerateContentConfig(
                system_instruction=full_system,
                temperature=0.7,
            ),
        )
        return response.text

    except Exception as exc:
        logger.warning("Gemini chat error: %s", exc)
        return "Oops! I encountered an error connecting to my AI engine. Please try again in a moment."
