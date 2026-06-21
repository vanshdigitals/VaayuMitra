# VaayuMitra — Architecture

## Overview

VaayuMitra is a full-stack carbon footprint tracker built for Indian households.
It combines India-specific emission data, a FastAPI backend, and a Next.js frontend
to give users accurate, actionable insights via Gemini AI.

```
Browser (Next.js 14)  →  FastAPI (Python 3.11)  →  Gemini AI / Firestore
```

---

## Frontend (Next.js 14 App Router)

| Route | Purpose |
|-------|---------|
| `/` | Landing page — hero, features, how-it-works |
| `/onboarding` | 5-step wizard: city → household → commute → diet → results |
| `/dashboard` | Carbon score ring, breakdown, top AI insight |
| `/track` | Daily activity logger (transport / food / energy tabs) |
| `/insights` | Full AI recommendations list with benchmarks |
| `/goals` | User-defined reduction goals with impact projection |
| `/chat` | Conversational AI assistant (Gemini) |
| `/settings` | App info, privacy details, data reset |

### Key Design Choices

- **App Router + `'use client'`** — pages that need state are client components. Static pages (layout, metadata) are server components by default.
- **Inline styles throughout** — intentional for zero build-time CSS overhead on a mobile-first PWA. Hover effects use injected `<style>` tags with CSS classes to avoid imperative DOM mutation.
- **`localStorage` state persistence** — no auth required. A random `device_id` identifies sessions anonymously.
- **`NavTabBar` + `AppHeader`** — shared layout components from `src/components/ui/Navigation.tsx` provide consistent chrome across all app pages.

---

## Backend (FastAPI + Python 3.11)

### Layer Architecture

| Layer | Module | Responsibility |
|-------|--------|---------------|
| **Domain** | `app/calculator.py` | Pure carbon math using CEA v21.0 and India GHG Program factors |
| **Insights** | `app/insights/` | Gemini AI prompt engineering + rule-based fallback engine |
| **Chat** | `app/chat/` | Multi-turn Gemini AI conversational interface |
| **Persistence** | `app/repository/` | Firestore (production) / in-memory (development) |
| **Transport** | `app/routes/` | HTTP endpoints with Pydantic v2 request/response validation |
| **Config** | `app/config.py` | Feature flags, environment variable binding |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/calculate` | Compute annual footprint breakdown |
| `POST` | `/api/insights` | Get Gemini AI recommendations (falls back to rules) |
| `POST` | `/api/chat` | Send/receive a chat turn |
| `POST` | `/api/entries` | Save a footprint snapshot |
| `GET` | `/api/entries/{device_id}` | List saved history |
| `GET` | `/api/health` | Liveness check |

---

## Emission Factor Sources

| Category | Factor Source | Value |
|----------|--------------|-------|
| Electricity | CEA CO₂ Baseline v21.0 (FY2024-25) | 0.71 kg CO₂/kWh |
| LPG | IPCC 2006 Guidelines | 2.983 kg CO₂/kg LPG |
| 2-Wheeler (petrol) | India GHG Program v1.0 (WRI/TERI/CII 2015) | 0.040 kg CO₂/km |
| Car (petrol) | India GHG Program v1.0 | 0.140 kg CO₂/km |
| Metro | India GHG Program v1.0 | 0.025 kg CO₂/km |
| Diet (vegetarian) | Pathak et al. 2010, ICAR-IARI | ~0.9 kg CO₂/day |
| Diet (non-vegetarian) | Pathak et al. 2010 | ~1.7 kg CO₂/day |

---

## Design Decisions

1. **India-specific factors**: CEA v21.0 over DEFRA because Indian grid emission factors differ significantly from UK/US averages.
2. **App factory pattern**: `create_app()` in `main.py` ensures fresh state per test run, preventing test pollution.
3. **Feature flags**: `use_gemini` and `use_firestore` in `config.py` allow local development without GCP credentials.
4. **Graceful degradation**: If Gemini AI is unavailable, the rule-based engine in `app/insights/rules.py` provides quantified recommendations with source citations.
5. **Anonymous tracking**: `localStorage` `device_id` (UUID v4) eliminates login friction while still allowing entry history per device.
6. **No SSR for user data**: User footprint data lives in `localStorage`, so dashboard/insights pages use `'use client'` and read on mount — avoids hydration mismatches.

---

## Infrastructure

```
Cloud Run (Frontend: Next.js)
    │
    ├── NEXT_PUBLIC_API_URL → Cloud Run (Backend: FastAPI)
    │       │
    │       ├── Firestore (anonymous entry history)
    │       └── Vertex AI / Gemini 1.5 Flash (insights + chat)
    │
    └── Cloud Build (CI/CD via cloudbuild.yaml)
```

### Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Frontend | Backend base URL |
| `GOOGLE_CLOUD_PROJECT` | Backend | GCP project for Vertex AI + Firestore |
| `USE_GEMINI` | Backend | Toggle Gemini AI (`true`/`false`) |
| `USE_FIRESTORE` | Backend | Toggle Firestore vs. in-memory repo |
| `GEMINI_MODEL` | Backend | Model name (default: `gemini-1.5-flash`) |
