# Contributing to VaayuMitra

Thank you for helping make India's carbon future brighter! 🌿

---

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Google Cloud project (optional — app runs fully offline without GCP credentials)

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate          # Linux/macOS
# .\.venv\Scripts\Activate.ps1     # Windows PowerShell

# Install dependencies
pip install -r requirements-dev.txt

# Run tests
pytest --cov=app --cov-fail-under=80

# Start dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npx vitest run

# Build (must pass with zero errors before submitting)
npm run build
```

---

## Quality Gates

All contributions must pass the following checks before merging:

| Gate | Command | Requirement |
|------|---------|------------|
| Backend tests | `pytest --cov=app` | Coverage ≥ 80% |
| Frontend build | `npm run build` | Zero ESLint errors |
| TypeScript types | `npx tsc --noEmit` | Zero type errors |
| Frontend tests | `npx vitest run` | All tests pass |

---

## Code Standards

### TypeScript (Frontend)

- **No `any` types** — use proper TypeScript types or `unknown` + type guards
- **No inline DOM style mutation** — use CSS classes or Tailwind for hover effects
- **Components** — keep pages focused; extract reusable UI to `src/components/`
- **API calls** — always go through `src/lib/api.ts`, never raw `fetch()` in pages

### Python (Backend)

- **Type hints** — all functions must have parameter and return type annotations
- **Pydantic models** — all API request/response bodies must use Pydantic v2 models
- **Tests** — every new route or domain function needs a corresponding test in `tests/`
- **Docstrings** — public functions and classes must have docstrings

---

## Emission Factor Policy

All emission factors must:
1. Be sourced from a peer-reviewed study or official Indian government dataset
2. Include the source citation (author, year, document name)
3. Be added to the table in `docs/ARCHITECTURE.md`

**Approved sources:**
- CEA CO₂ Baseline (latest version)
- India GHG Program (WRI/TERI/CII)
- Pathak et al. (ICAR-IARI) for diet factors
- IPCC Guidelines for fuel combustion

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add cycle/e-bike commute mode
fix: correct LPG factor for 19kg cylinders
docs: update emission factor table
test: add calculator edge case for zero km
refactor: extract NavTabBar to shared component
```

---

## Local Development Without GCP

Set these in `backend/.env`:

```env
USE_GEMINI=false
USE_FIRESTORE=false
```

The app will use rule-based insights and in-memory storage — no GCP credentials needed.
