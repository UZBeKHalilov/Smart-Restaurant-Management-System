# 🍽️ Smart Restaurant Management System — BitePlate

Full-stack restaurant management system built with **ASP.NET 9 Clean Architecture** + **Angular 19**.

---

## Project Structure

```
Smart-Restaurant-Management-System/
├── API/                             # ASP.NET Clean Architecture backend
│   ├── SmartRestaurant.sln
│   └── src/
│       ├── SmartRestaurant.Domain/          # Entities, Enums, Interfaces
│       ├── SmartRestaurant.Application/     # CQRS (MediatR), DTOs, Validators
│       ├── SmartRestaurant.Infrastructure/  # EF Core, SQL Server, JWT
│       └── SmartRestaurant.API/             # Controllers, Program.cs, Swagger
└── UI/                              # Angular 19 frontend
    └── src/app/
        ├── core/        # Auth service, interceptors, guards, API service
        ├── features/    # Login, Dashboard, Tables, Menu, Orders, Kitchen, Bills
        ├── layout/      # Shell with sidenav
        └── shared/      # Models
```

---

## Getting Started

### Backend (API)

**Prerequisites:** .NET 9 SDK, SQL Server (or SQL Server Express / localdb)

1. Update connection string if needed in `API/src/SmartRestaurant.API/appsettings.json`:
   ```json
   "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SmartRestaurantDb;Trusted_Connection=True;"
   ```

2. Apply EF Core migrations:
   ```bash
   cd API/src/SmartRestaurant.API
   dotnet ef database update --project ../SmartRestaurant.Infrastructure
   ```

3. Start the API:
   ```bash
   dotnet run
   ```
   API runs at `https://localhost:7001`. Swagger UI at `/swagger`.

> The app auto-seeds the database on first run: 10 tables, 4 categories, 10 menu items, and a default Manager account.

### Frontend (UI)

**Prerequisites:** Node.js 18+, Angular CLI 19

```bash
cd UI
npm install
ng serve
```

App runs at `http://localhost:4200`.

---

## Default Credentials

| Role    | Email                 | Password    |
|---------|-----------------------|-------------|
| Manager | manager@biteplate.com | Manager@123 |

Register additional staff via `POST /api/auth/register` with roles: `Waiter`, `Chef`, `Cashier`.

---

## Features

| Feature           | Description                                                |
|-------------------|------------------------------------------------------------|
| **Auth**          | JWT login, role-based access (Manager/Waiter/Chef/Cashier) |
| **Tables**        | View & manage table status (Available/Occupied/Reserved/Cleaning) |
| **Menu**          | Browse by category, CRUD for Manager                       |
| **Orders**        | Create orders from available tables, track status          |
| **Kitchen Queue** | Real-time queue with auto-refresh every 15s (Chef/Manager) |
| **Bills**         | Generate bills with 10% tax, accept Cash/Card/QR (Cashier/Manager) |
| **Dashboard**     | Live stats: occupied tables, pending/preparing/ready orders |

---

## Architecture

### Backend — Clean Architecture

```
Domain         →  zero dependencies (entities, enums, interfaces)
Application    →  depends on Domain (CQRS, MediatR, DTOs, AutoMapper, FluentValidation)
Infrastructure →  depends on Application (EF Core, SQL Server, Identity, JWT)
API            →  depends on Application + Infrastructure (controllers, Program.cs)
```

### Frontend — Angular 19

- Standalone Components (no NgModules)
- Signals for reactive state
- Lazy-loaded routes
- Functional HTTP Interceptor for JWT injection
- Role-based route guards
- Angular Material UI (indigo-pink theme)

---

## Tech Stack

| Layer     | Technology                                           |
|-----------|------------------------------------------------------|
| Backend   | ASP.NET 9, EF Core 9, SQL Server, ASP.NET Identity  |
| CQRS      | MediatR 12, AutoMapper 13, FluentValidation 11       |
| Auth      | JWT Bearer tokens, HS256, 8-hour expiry              |
| Frontend  | Angular 19, Angular Material 19, RxJS, TypeScript    |

---

## API Endpoints

| Method | Endpoint                      | Auth / Role           |
|--------|-------------------------------|-----------------------|
| POST   | /api/auth/login               | Public                |
| POST   | /api/auth/register            | Public                |
| GET    | /api/tables                   | Any authenticated     |
| POST   | /api/tables                   | Manager               |
| PATCH  | /api/tables/{id}/status       | Any authenticated     |
| GET    | /api/menu/items               | Public                |
| GET    | /api/menu/categories          | Public                |
| POST   | /api/menu/items               | Manager               |
| PUT    | /api/menu/items/{id}          | Manager               |
| DELETE | /api/menu/items/{id}          | Manager               |
| GET    | /api/orders                   | Any authenticated     |
| POST   | /api/orders                   | Waiter, Manager       |
| PATCH  | /api/orders/{id}/status       | Chef, Waiter, Manager |
| DELETE | /api/orders/{id}              | Waiter, Manager       |
| GET    | /api/kitchen/queue            | Chef, Manager         |
| PATCH  | /api/kitchen/{id}/start       | Chef, Manager         |
| PATCH  | /api/kitchen/{id}/ready       | Chef, Manager         |
| POST   | /api/bills/generate/{orderId} | Cashier, Manager      |
| PATCH  | /api/bills/{id}/pay           | Cashier, Manager      |
