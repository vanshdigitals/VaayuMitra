# VaayuMitra — वायुमित्र

### India's AI-Powered Carbon Footprint Companion

> **"Friend of the Atmosphere"** — Built for India. Powered by Gemini. Deployed on Google Cloud Run.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloud%20Run-4285F4?style=for-the-badge&logo=googlecloud)](https://vaayumitra-216175773868.asia-south1.run.app)
[![Tests](https://img.shields.io/badge/Tests-40%20passing-2ea44f?style=for-the-badge)](backend/tests)
[![PromptWars](https://img.shields.io/badge/PromptWars-Challenge%203-orange?style=for-the-badge)](https://promptwars.in)

**Live:** https://vaayumitra-216175773868.asia-south1.run.app

---

## The Problem

Almost every carbon footprint app was built for UK or US users. They use Western grid factors
(~0.23 kgCO₂/kWh), ask about "home heating" and "square footage," and recommend "shorter showers."

**India's grid factor is 0.71 kgCO₂/kWh** — roughly 3× higher (CEA v21.0). An Indian using 200 kWh/month
gets a footprint that's 3× wrong in every Western app.

And those apps guilt-trip users. Indians are already among the world's lowest per-capita emitters
(**1.84 t/yr** vs the US's 16.21 t/yr). They don't need shame — they need an accurate companion that
celebrates their low impact and helps them go further.

**VaayuMitra** is that companion.

---

## What It Does

Answer five questions about your Indian lifestyle → get an accurate India-specific footprint in under
two minutes → receive AI recommendations calibrated for Indian life → track habits → chat with an AI
advisor that understands Hinglish.

| Feature | Description |
|---------|-------------|
| **Carbon Calculator** | Accurate annual footprint across electricity, LPG, transport, and diet — deterministic, CEA v21.0 sourced |
| **Dashboard** | Hero carbon score compared against the India average (1.84 t/yr), not Western benchmarks |
| **AI Insights** | Personalized, quantified recommendations ranked from your *actual* emission breakdown |
| **Daily Tracking** | Log entries against an anonymous device ID |
| **Goals** | Goal tracker with forward projections |
| **AI Chat** | Conversational advisor; Hinglish-aware system prompt |

---

## Architecture

A **single Cloud Run container** serves both the API and the compiled frontend from the same origin —
no CORS, one deploy, one URL.

```
┌──────────────────────────────────────────────────────────┐
│  Next.js 14 (App Router, TypeScript) — static export     │
│  Typed API client (lib/api.ts ← lib/types.ts)            │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTP (same origin)
┌───────────────────────────▼──────────────────────────────┐
│  Single Cloud Run container (asia-south1)                │
│  FastAPI (Python 3.11) — create_app() factory            │
│  ├── /api/health    → version + status                   │
│  ├── /api/calculate → calculator.py (pure functions)     │
│  ├── /api/insights  → insights/ (Gemini + rules fallback)│
│  ├── /api/chat      → chat/gemini.py                      │
│  ├── /api/entries   → repository/ (Firestore | in-memory)│
│  └── /*             → static Next.js export               │
└───────────────────────────┬──────────────────────────────┘
                ┌────────────┴────────────┐
        ┌───────▼────────┐       ┌────────▼─────────┐
        │   Firestore    │       │  Gemini API      │
        │  (asia-south1) │       │ (gemini-2.5-flash)│
        └────────────────┘       └──────────────────┘
```

### Engineering patterns
- **Application factory** (`create_app()`) so tests get fresh settings + repository per run
- **Protocol-based repository pattern** — `EntryRepository` → `FirestoreEntryRepository` | `InMemoryEntryRepository`, selected by feature flag
- **Dependency injection** via FastAPI `Depends()` + `@lru_cache` providers in `deps.py`
- **Feature flags** (`USE_GEMINI`, `USE_FIRESTORE`) — run fully offline with zero GCP credentials
- **Typed boundaries** — `response_model=` on every route; TypeScript types mirror the Pydantic models
- **Graceful degradation** — every Gemini call falls back to a deterministic rule engine (`source: "rules"`)

---

## India-Specific Emission Factors

Every constant cites its primary source — these are research data, not estimates.

| Category | Factor | Value | Source |
|----------|--------|-------|--------|
| Electricity | Grid emission factor | **0.71 kgCO₂/kWh** | CEA CO₂ Baseline Database v21.0, FY2024-25 |
| Car (petrol, mid-size) | Per km | 0.140 kgCO₂/km | India GHG Program v1.0 (WRI/TERI/CII, 2015) |
| 2-Wheeler (petrol) | Per km | 0.040 kgCO₂/km | India GHG Program v1.0 |
| Metro | Per passenger-km | 0.025 kgCO₂/km | Derived from CEA factor |
| Auto (CNG) | Per km | 0.108 kgCO₂/km | India GHG Program v1.0 |
| Vegetarian diet | Per day | 0.72 kgCO₂e/day | Pathak et al. 2010, ICAR-IARI |
| Non-veg diet | Per day | ~1.03 kgCO₂e/day | Pathak et al. 2010, ICAR-IARI |
| LPG cylinder (14.2 kg) | Per cylinder | **42.36 kgCO₂** | IPCC 2006 Guidelines, Vol. 2 |

**Benchmarks:** India per-capita 1.84 t/yr (World Bank 2022) · Paris 1.5 °C equal-share 2.5 t/yr · US 16.21 t/yr.

See [`backend/app/emission_factors.py`](backend/app/emission_factors.py) for the cited source on every constant.

---

## How Gemini Is Used

Gemini is strictly an **insight and conversation layer** — never a calculator.

```
calculator.py (deterministic) → "how much CO₂?"
Gemini                        → "what should I do about it?"
```

Insights and chat run through the `google-genai` SDK (`gemini-2.5-flash`). If `USE_GEMINI=false` or no
API key is set, the app serves rule-based insights instead — ranked from the user's actual footprint
breakdown — and the demo never breaks.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, static export |
| Backend | FastAPI (Python 3.11), Pydantic, pydantic-settings |
| AI | Google Gemini (`google-genai` SDK, `gemini-2.5-flash`) |
| Database | Firestore (Native mode, asia-south1) — feature-flagged, in-memory fallback for local/tests |
| Auth | Anonymous device ID (`crypto.randomUUID()`, localStorage) — no login wall |
| Deployment | Cloud Run (asia-south1), multi-stage Docker build |
| Testing | pytest (40 tests), Vitest (frontend API client) |

---

## Folder Structure

```
VaayuMitra/
├── backend/
│   ├── app/
│   │   ├── main.py              ← create_app() factory + static SPA serving
│   │   ├── config.py            ← Settings (feature flags, CORS), lru_cache
│   │   ├── calculator.py        ← pure footprint functions — no AI
│   │   ├── emission_factors.py  ← India-specific constants (cited)
│   │   ├── models.py            ← Pydantic request/response models
│   │   ├── deps.py              ← DI providers (get_settings, get_repository)
│   │   ├── insights/            ← gemini.py + rules.py (dynamic fallback engine)
│   │   ├── chat/                ← Gemini chat service
│   │   ├── repository/          ← Protocol + Firestore + in-memory implementations
│   │   └── routes/              ← thin route handlers (health, calculate, entries)
│   └── tests/                   ← conftest (lru_cache isolation) + 40 tests
├── frontend/
│   └── src/
│       ├── app/                 ← App Router pages (landing, onboarding, dashboard,
│       │                          track, insights, goals, settings, chat)
│       └── lib/                 ← api.ts, types.ts, deviceId.ts
├── Dockerfile                   ← multi-stage: Node build → Python serve
├── cloudbuild.yaml              ← Cloud Build config
└── docs/ARCHITECTURE.md
```

---

## Local Development

### Prerequisites
- Node.js 20+ · Python 3.11+ · (optional) Docker, gcloud CLI

### Backend

```bash
cd backend
pip install -r requirements.txt

# Run fully offline — no GCP credentials needed
USE_GEMINI=false USE_FIRESTORE=false uvicorn app.main:app --reload --port 8080

# Run tests
python -m pytest tests/ -v        # 40 passing
```

### Frontend

```bash
cd frontend
npm install
npm run dev                       # http://localhost:3000
npm run test                      # Vitest
```

### Environment Variables (backend)

| Variable | Default | Purpose |
|----------|---------|---------|
| `USE_GEMINI` | `true` | Toggle Gemini; `false` serves rule-based insights |
| `USE_FIRESTORE` | `true` | Toggle Firestore; `false` uses in-memory store |
| `GEMINI_API_KEY` | `""` | Gemini API key (required when `USE_GEMINI=true`) |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model id |
| `ALLOWED_ORIGINS` | `localhost:3000,...` | Comma-separated CORS origins |
| `GCP_PROJECT` | `vaayumitra` | GCP project for Firestore |

---

## Deployment

```bash
gcloud run deploy vaayumitra \
  --source . \
  --region=asia-south1 \
  --allow-unauthenticated \
  --min-instances=1 \
  --memory=1Gi \
  --port=8080

# To enable AI chat/insights in production, pass the Gemini key:
gcloud run deploy vaayumitra --source . --region=asia-south1 \
  --set-env-vars USE_GEMINI=true,GEMINI_API_KEY=<your-key>
```

The Docker build compiles the Next.js static export and copies it into the Python image at `app/static/`,
which FastAPI serves for all non-API routes.

---

## Privacy

- **No personal data.** Anonymous device IDs generated locally (`crypto.randomUUID()`).
- **No account, no email, no sign-up.** The full product works without login.
- **No third-party analytics.** No tracking pixels.
- Data stored in Firestore under your anonymous device ID only.

---

## Data Sources

| Source | Powers |
|--------|--------|
| CEA CO₂ Baseline Database v21.0 (FY2024-25) | Electricity grid factor (0.71 kgCO₂/kWh) |
| India GHG Program v1.0 — WRI India / TERI / CII (2015) | Transport factors |
| Pathak H. et al. (2010), ICAR-IARI | Diet factors |
| IPCC 2006 Guidelines, Vol. 2 | LPG emission factor |
| World Bank Open Data (2022) | India per-capita benchmark |

---

## License

MIT — see [LICENSE](LICENSE).

---

*VaayuMitra — वायुमित्र — Friend of the Atmosphere. Built for Bharat, one footprint at a time.*
