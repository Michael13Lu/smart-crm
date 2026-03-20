# Smart CRM

A production-quality CRM demo for small and medium businesses.

Built to showcase real-world full-stack architecture with clean code, modern UI, and live data.

## Live Demo

| | URL |
|---|---|
| **App** | https://frontend-peach-mu-96.vercel.app |
| **API** | https://smart-crm-api-production.up.railway.app |

## Tech Stack

| Layer    | Technology                           |
|----------|--------------------------------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend  | ASP.NET Core 9, Clean Architecture   |
| Database | PostgreSQL (Railway)                 |
| Auth     | ASP.NET Identity + JWT               |
| Deploy   | Vercel (frontend) · Railway (backend)|

## Features

- **Leads** — create, filter, assign, track status
- **Deal Pipeline** — Kanban board with drag-and-drop stage moves
- **Tasks** — assign, prioritize, mark complete
- **Dashboard** — real-time stats, pipeline chart, activity feed
- **Role-based access** — Admin / Manager / Viewer

## Demo Accounts

| Role    | Email                 | Password  |
|---------|-----------------------|-----------|
| Admin   | admin@smartcrm.demo   | Demo@123! |
| Manager | sarah@smartcrm.demo   | Demo@123! |
| Viewer  | emily@smartcrm.demo   | Demo@123! |

## Local Development

### Backend

```bash
cd backend/SmartCRM.API
dotnet run
# API runs on http://localhost:5103
```

Requires PostgreSQL. Set connection string in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=SmartCRM;Username=postgres;Password=postgres"
}
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5103
```

## Project Structure

```
Smart-CRM/
├── backend/
│   ├── Dockerfile
│   ├── railway.toml
│   ├── SmartCRM.API/           # Controllers, Program.cs, Extensions
│   ├── SmartCRM.Core/          # Entities, Interfaces, DTOs
│   └── SmartCRM.Infrastructure/# EF Core, Repositories, JWT, Seeder
└── frontend/
    └── src/
        ├── app/                # Next.js App Router pages
        ├── components/         # Shared UI (Sidebar, Header, StatusBadge)
        ├── features/           # leads, deals, tasks, dashboard
        ├── services/           # API service layer (axios)
        ├── lib/                # axios instance, AuthContext
        └── types/              # TypeScript types
```

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Any |
| GET | `/api/auth/users` | Admin, Manager |
| POST | `/api/auth/register` | Admin |
| GET/POST | `/api/leads` | Any / Manager+ |
| GET/PUT/DELETE | `/api/leads/{id}` | Any / Manager+ |
| GET/POST | `/api/deals` | Any / Manager+ |
| PATCH | `/api/deals/{id}/stage` | Manager+ |
| GET/POST | `/api/tasks` | Any / Manager+ |
| PATCH | `/api/tasks/{id}/complete` | Any |
| GET | `/api/dashboard/stats` | Any |
| GET | `/api/activity` | Any |
| GET | `/health` | Public |
