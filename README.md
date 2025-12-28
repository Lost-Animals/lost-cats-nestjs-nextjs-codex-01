# lost-cats-nestjs-nextjs-codex-01

## Local setup

### Backend (NestJS)

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run start:dev
```

API runs at `http://localhost:3001/api/v1`.

### Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Web app runs at `http://localhost:3000`.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+

## Environment configuration

Backend environment variables live in `backend/.env`. Start from:

```bash
cp backend/.env.example backend/.env
```

Frontend environment variables live in `frontend/.env.local`. Start from:

```bash
cp frontend/.env.example frontend/.env.local
```

## Docker (optional)

This repository includes a simple Docker Compose setup (Postgres + API + Web).

```bash
docker compose up --build
```

Services:
- Web: `http://localhost:3000`
- API: `http://localhost:3001/api/v1`
- Postgres: `localhost:5432` (user/password/db: `postgres/postgres/lostcats`)

If you need GCS credentials, add them to the `api` service in `docker-compose.yml`.
