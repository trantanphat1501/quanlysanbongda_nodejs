# quanlysanbong-nodejs

Backend for the football field management system, built with NodeJS.

## Best-practice stack used
- NodeJS + TypeScript
- Express
- Prisma ORM (MySQL)
- JWT auth + role-based authorization
- Swagger UI (`/swagger-ui`) and OpenAPI JSON (`/v3/api-docs`)

## 1) Setup

```bash
cd /Users/william/Downloads/quanlysanbong-nodejs
cp .env.example .env
```

Update `.env` with your MySQL credentials.

## 2) Prisma setup

```bash
npm run prisma -- generate
npm run prisma -- db push
npm run seed
```

## 3) Run dev server

```bash
npm run dev
```

Server runs on `http://localhost:8080` by default.

## Frontend compatibility
- Frontend can call `/api/*`.
- Keep Vite proxy target at `http://localhost:8080`.

## Demo users (auto-seeded)
- Admin: `0000000000` / `123456`
- User: `1111111111` / `123456`

## API groups
- Auth
- NguoiDung
- SanBong
- GiaTien
- HinhAnh
- LichSu
- Team
- Tournament
- TournamentTeam
- Match
- MatchEvent
