# Changelog

All notable changes to VaayuMitra are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] — 2026-06-22

### Added
- Gemini 2.5 Flash AI integration for personalised carbon insights and chat
- Repository pattern with Protocol base, in-memory and Firestore implementations
- `POST /api/entries` and `GET /api/entries/{device_id}` history endpoints
- `deps.py` dependency-injection provider using `@lru_cache`
- Dynamic rule engine (`insights/rules.py`) — ranks actual emission breakdown, not a static list
- Full TypeScript type system in `frontend/src/lib/types.ts`
- Shared `deviceId.ts` utility with `crypto.randomUUID` + fallback
- CSP + security headers middleware (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- Multi-stage Dockerfile: Node build → Python slim runtime
- Cloud Run deployment on `asia-south1` with `--min-instances=1`
- GitHub Actions CI: ruff lint + pytest (backend), tsc + eslint (frontend)
- `pyproject.toml` with strict mypy and ruff configuration
- `.pre-commit-config.yaml` enforcing ruff, prettier, and file hygiene

### Fixed
- CORS origins now read from `ALLOWED_ORIGINS` env var — no longer hardcoded
- `create_app()` factory enables per-test environment configuration
- `lru_cache` isolation in test suite via `autouse` fixture in `conftest.py`
- Gemini settings injected as parameters — no module-level state bleed
- `extra="ignore"` in `SettingsConfigDict` prevents unknown env var crashes
- CSP now allows `api.fontshare.com` for Cabinet Grotesk font loading
- Chat endpoint `sendChat` argument order fixed (was passing object, not two args)

### Changed
- `calculator.py` now returns typed `CalculateResponse` instead of raw dict
- `insights/gemini.py` uses `response_mime_type="application/json"` + 2048 tokens
- Default Gemini model upgraded to `gemini-2.5-flash`
- Vertex AI ADC fallback when no API key is set

## [1.0.0] — 2026-06-21

### Added
- Initial MVP: FastAPI backend + Next.js 14 frontend
- CEA v21.0 electricity emission factor (0.71 kgCO₂/kWh)
- India GHG Program transport factors
- Pathak et al. diet emission factors
- 40 passing tests (20 calculator unit + 18 API integration + 2 model)
- Onboarding flow, Dashboard, Insights, Track, Goals, Chat, Settings pages
- Bottom navigation with 5 tabs
- Dark amber design system (`#D4A853` accent, `#111009` background)
