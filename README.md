# Carbon & Crimson IMS (Motorcycle & Gear Inventory Management System)

Production-ready, high-performance Inventory Management System (IMS) with a "God Mode" UI theme: **Carbon & Crimson**.

## Stack

- Frontend: React (Vite), Tailwind CSS, Framer Motion, Lucide React, Recharts
- Backend: Node.js, Express.js
- DB: MongoDB (Mongoose)
- State: TanStack Query (React Query)
- Deploy: Vercel (frontend) + Render (backend) or Docker Compose (one command)

---

## One-command local deployment (Docker)

### Prerequisites
- Docker Desktop (or Docker Engine + Compose)

### Run
```bash
docker compose up --build
```

Then open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/health

**Default seed users** (created on first boot):
- Admin: `admin@ims.local` / `Admin#1234`
- Staff: `staff@ims.local` / `Staff#1234`

> You can change these in `backend/.env` (see templates).

---

## Manual installation (without Docker)

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs at: http://localhost:8080

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Environment variables

### Backend (`backend/.env`)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: strong random string
- `JWT_EXPIRES_IN`: e.g. `7d`
- `API_NINJAS_KEY`: your API Ninjas key (Motorcycles API)
- `CORS_ORIGIN`: e.g. `http://localhost:5173`
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`
- `SEED_STAFF_EMAIL`, `SEED_STAFF_PASSWORD`

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL`: e.g. `http://localhost:8080/api`

---

## API quick tour

- `POST /api/auth/login` → { token, user }
- `GET /api/inventory` (auth) → list items
- `POST /api/inventory` (admin/staff) → create item
- `PATCH /api/inventory/:id/stock` (admin/staff) → move stock (creates audit log entry)
- `GET /api/analytics/summary` (auth) → dashboard charts
- `GET /api/compat/motorcycles?make=...&model=...&year=...` (auth) → API Ninjas + local compatible parts

---

## Notes

- The QR/Barcode feature is mock-safe: it generates QR codes for SKUs and provides a simulated "scan" input that queries inventory by SKU.
- Low-stock triggers are calculated server-side and exposed via API; the UI uses pulsing "Emergency" styling for parts below threshold.
- Audit log tracks **who moved what stock** with before/after quantities.

---

## Folder structure

```
carbon-crimson-ims/
  docker-compose.yml
  backend/
  frontend/
```

---

## License
MIT


## Run without Docker (Recommended for local dev)

### Prerequisites
- Node.js 18+ (or 20+)
- MongoDB running locally (default: mongodb://127.0.0.1:27017)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open: http://localhost:5173

> If you see a blank screen, check the browser console for errors. This repo keeps `src/views/dashboard_page.jsx` as a tiny wrapper to prevent routing-level crashes.
