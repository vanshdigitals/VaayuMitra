"""FastAPI application factory.

Using create_app() rather than a module-level `app = FastAPI()` lets tests
call create_app() after clearing lru_cache, so each test suite starts with
fresh settings and a fresh repository — no state leaks between test runs.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.config import get_settings
from app.routes import health, calculate, entries


class _SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data:; "
            "connect-src 'self'"
        )
        return response


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="VaayuMitra API",
        description="India's AI-powered carbon footprint companion",
        version="1.0.0",
    )

    app.add_middleware(_SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(calculate.router)
    app.include_router(entries.router)

    return app


# Module-level app instance for uvicorn: `uvicorn app.main:app`
app = create_app()
