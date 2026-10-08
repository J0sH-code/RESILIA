# RESILIA

RESILIA is a disaster-aware planning platform for identifying communities underserved by critical facilities and evaluating potential facility locations.

The platform combines population, facility, transportation, and hazard data to support resilient infrastructure planning.

## Stack

- Frontend: React, Vite, JavaScript
- Backend: FastAPI, Python
- CI: GitHub Actions

## Repository structure

```text
.
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/routes/       # API route handlers
│   │   ├── core/             # Application configuration
│   │   ├── schemas/          # Pydantic request and response schemas
│   │   ├── services/         # Business logic and analysis services
│   │   └── main.py           # FastAPI application entrypoint
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
├── .github/workflows/ci.yml
└── README.md
```

## Prerequisites

- Python 3.11 or later
- Node.js 22 or later
- npm

## Backend setup

From the `backend` directory:

```bash
python -m venv .venv
source .venv/Scripts/activate        # Git Bash
# .\\.venv\\Scripts\\Activate.ps1      # PowerShell
python -m pip install -r requirements.txt
cp .env.example .env                # Git Bash
# Copy-Item .env.example .env        # PowerShell
```

Run the API:

```bash
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

Run backend tests:

```bash
python -m pytest
```

## Frontend setup

From the `frontend` directory:

```bash
npm install
cp .env.example .env                # Git Bash
# Copy-Item .env.example .env        # PowerShell
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Configuration

Copy the relevant `.env.example` file to `.env` for local development.

- Backend: `CORS_ORIGINS`, application name, and environment settings
- Frontend: `VITE_API_BASE_URL`

Do not commit `.env` files or secrets. Only `.env.example` files should be committed.

## Development conventions

- Keep API route handlers focused on HTTP concerns.
- Put request and response models in `backend/app/schemas/`.
- Put reusable business logic in `backend/app/services/`.
- Add database models and repositories when persistent storage is introduced.
- Add tests for new backend behavior.
- Keep frontend API calls and UI components separated by feature as the frontend grows.

## Continuous integration

The GitHub Actions workflow is located at `.github/workflows/ci.yml`.

It currently:

- Installs backend dependencies and runs `python -m pytest`.
- Installs frontend dependencies and runs `npm run build`.
- Runs on pull requests and pushes to `main`.

CI validates the code but does not deploy the application.
