"""
Shared test fixtures.

Critical: clear lru_cache before and after each test so that environment
variable overrides take effect and never bleed between test functions.
"""
from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def _reset_caches():
    """Clear all lru_cache singletons before and after every test."""
    from app.config import get_settings
    from app.deps import get_repository

    get_settings.cache_clear()
    get_repository.cache_clear()
    yield
    get_settings.cache_clear()
    get_repository.cache_clear()


@pytest.fixture
def client(monkeypatch):
    """
    TestClient with Gemini and Firestore disabled.
    No GCP credentials needed — uses in-memory repository and rule-based insights.
    """
    monkeypatch.setenv("USE_GEMINI", "false")
    monkeypatch.setenv("USE_FIRESTORE", "false")
    monkeypatch.setenv("GEMINI_API_KEY", "")

    from app.config import get_settings
    from app.deps import get_repository
    get_settings.cache_clear()
    get_repository.cache_clear()

    from app.main import create_app
    return TestClient(create_app())
