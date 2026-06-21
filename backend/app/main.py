"""FastAPI application factory.

Using create_app() rather than a module-level `app = FastAPI()` lets tests
call create_app() after clearing lru_cache, so each test suite starts with
fresh settings and a fresh repository — no state leaks between test runs.
"""
from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.config import get_settings
from app.routes import health, calculate, entries

# Resolve the static/ directory (Next.js export output, copied in Dockerfile)
_STATIC_DIR = Path(__file__).parent.parent / "static"


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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data:; "
            "connect-src 'self' https://*.run.app"
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

    # Serve compiled Next.js static export if the directory exists
    if _STATIC_DIR.is_dir():
        app.mount("/_next", StaticFiles(directory=str(_STATIC_DIR / "_next")), name="next-assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        async def spa_fallback(full_path: str):
            """Serve the Next.js SPA — return the matching .html or fall back to index.html."""
            # Try exact file match first (e.g. /onboarding -> onboarding.html)
            candidate = _STATIC_DIR / full_path
            if candidate.is_file():
                return FileResponse(str(candidate))
            html_candidate = _STATIC_DIR / f"{full_path}.html"
            if html_candidate.is_file():
                return FileResponse(str(html_candidate))
            index = _STATIC_DIR / "index.html"
            if index.is_file():
                return FileResponse(str(index))
            return FileResponse(str(_STATIC_DIR / "404.html"), status_code=404)

    return app


# Module-level app instance for uvicorn: `uvicorn app.main:app`
app = create_app()

