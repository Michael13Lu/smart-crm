# Smart CRM

A production-quality CRM demo for small and medium businesses.

Built to showcase real-world full-stack architecture with clean code, modern UI, and live data.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 15, TypeScript, Tailwind CSS |
| Backend    | ASP.NET Core 9, Clean Architecture  |
| Database   | SQL Server / LocalDB                |
| Auth       | ASP.NET Identity + JWT              |

## Features

- **Leads** — create, filter, assign, track status
- **Deal Pipeline** — Kanban board with drag-and-drop stage moves
- **Tasks** — assign, prioritize, mark complete
- **Dashboard** — real-time stats, pipeline chart, activity feed
- **Role-based access** — Admin / Manager / Viewer

## Demo Accounts

| Role    | Email                     | Password   |
|---------|---------------------------|------------|
| Admin   | admin@smartcrm.demo       | Demo@123!  |
| Manager | sarah@smartcrm.demo       | Demo@123!  |
| Viewer  | emily@smartcrm.demo       | Demo@123!  |

## Getting Started

### Backend

```bash
cd backend/SmartCRM.API
dotnet run
# API runs on http://localhost:5103
```

> Requires SQL Server or LocalDB. Connection string in `appsettings.json`.

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

## Project Structure

```
Smart-CRM/
├── backend/
│   ├── SmartCRM.API/           # Controllers, Program.cs
│   ├── SmartCRM.Core/          # Entities, Interfaces, DTOs
│   └── SmartCRM.Infrastructure/# EF Core, Repositories, JWT
└── frontend/
    └── src/
        ├── app/                # Next.js App Router pages
        ├── components/         # Shared UI components
        ├── features/           # Feature modules (leads, deals, tasks)
        ├── services/           # API service layer
        ├── lib/                # axios, auth context
        └── types/              # TypeScript types
```
