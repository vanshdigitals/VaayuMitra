# Contributing to VaayuMitra

## Development Setup

**Prerequisites:** Python 3.11+, Node.js 20+

```bash
# Backend
cd backend
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Frontend dev server proxies `/api/*` to `http://localhost:8000` via `next.config.mjs`.

## Running Tests

```bash
# Backend — unit + integration (in-memory, no GCP credentials needed)
cd backend
pytest --cov=app --cov-report=term-missing

# Frontend — component and API tests
cd frontend
npx vitest run
```

## Code Quality

```bash
# Backend
cd backend
ruff check app/       # lint
ruff format app/      # format
mypy app/             # type-check

# Frontend
cd frontend
npx tsc --noEmit      # type-check
npx next lint --dir src
```

## Contribution Guidelines

1. **Thin routes** — business logic belongs in `calculator.py`, `insights/`, or `chat/`. Route handlers should be < 10 lines.
2. **Emission factors require citations** — any new factor needs a peer-reviewed reference (CEA, IPCC, India GHG Program, Pathak et al., ICAR-IARI).
3. **Test coverage** — backend PRs must maintain or improve `--cov-fail-under=70`.
4. **Accessibility** — all interactive frontend elements need `aria-label` or visible text.
5. **No hardcoded secrets** — use environment variables; Vertex AI uses Application Default Credentials.
6. **Type safety** — no `any` types in production code; test mocks use `ReturnType<typeof vi.fn>`.
7. **Format before committing** — `ruff format app/` for Python, `prettier` (via pre-commit) for TypeScript.

## Architecture

```
VaayuMitra/
├── backend/
│   └── app/
│       ├── main.py          # FastAPI factory, middleware, SPA serving
│       ├── config.py        # Pydantic-settings with @lru_cache
│       ├── models.py        # Pydantic I/O schemas
│       ├── calculator.py    # Pure-functional emission calculator
│       ├── deps.py          # DI provider (@lru_cache)
│       ├── repository/      # Protocol + in-memory + Firestore backends
│       ├── routes/          # Thin route handlers
│       ├── insights/        # Gemini AI + deterministic rule fallback
│       └── chat/            # Conversational Gemini endpoint
├── frontend/
│   └── src/
│       ├── app/             # Next.js 14 App Router pages
│       ├── components/ui/   # Shared UI components
│       ├── hooks/           # useCarbon — central async state hook
│       └── lib/             # api.ts, types.ts, deviceId.ts, demo.ts
└── Dockerfile               # Multi-stage: Node builder → Python slim runtime
```
