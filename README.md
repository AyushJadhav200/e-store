# E-Store

Starter for a split frontend/backend e-commerce app. Clone this repo, install both apps, and start developing.

## Stack

- **Frontend** (`frontend/`): SvelteKit, TypeScript, Tailwind CSS — [http://localhost:5173](http://localhost:5173)
- **Backend** (`backend/`): FastAPI (Python) — [http://localhost:8000](http://localhost:8000)

Sample product data lives in the API so the storefront can load without a database yet.

## Clone and run

```bash
git clone <repo-url>
cd E-Store
```

### Backend

Needs Python 3.9+.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The home page calls `GET /api/health` and `GET /api/products`.

## Folders

```
frontend/   SvelteKit storefront
backend/    FastAPI API
```

Add product pages, cart, auth, and a real database on top of this layout.
