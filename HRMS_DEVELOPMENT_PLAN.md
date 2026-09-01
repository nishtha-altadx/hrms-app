# HRMS Full-Stack Build Plan

## Context

This is a full-stack Human Resource Management System (learning/portfolio project) with three roles (Admin/HR, Supervisor/Manager, Employee).

**Revision note (2nd revision)**: The project went from a two-project Express+Next.js split, to a single-Next.js-app design (Milestone 0 was built and committed on that basis), and is now moving to a **two-project split again**, per a teammate's (Siddharth's) recommendation: **frontend = Next.js, backend = NestJS**. This restores separate frontend/backend processes, but replaces Express with NestJS for a more structured, batteries-included backend (modules, DI, guards, decorators, built-in validation pipes) that pairs naturally with TypeORM. The already-committed Milestone 0 work (single Next.js app with TypeORM + a `/api/health` route) is being restructured: the Next.js app becomes the `frontend/` project (API routes and TypeORM code removed), and a new NestJS `backend/` project is created, absorbing the existing TypeORM entities/data-source setup.

Key decisions (updated):
- **Architecture**: Two separate apps/processes — `frontend/` (Next.js, UI only) and `backend/` (NestJS, all REST APIs) — in **one single GitHub repository** (not two repos).
- **Auth**: NestJS owns authentication entirely. It handles the Credentials flow (bcrypt + TypeORM `User` lookup) and Google OAuth (via `passport-google-oauth20` through NestJS's Passport integration), and issues JWT access + refresh tokens as httpOnly cookies (set by NestJS responses) consumed by the Next.js frontend. **NextAuth/Auth.js is no longer used** — it doesn't fit a setup where a separate backend, not Next.js itself, owns the session/OAuth callback.
- **Database**: PostgreSQL (local instance already installed, `hrms_dev` database already created) + TypeORM for entities/migrations, owned entirely by the `backend/` project.
- **Repository**: Single GitHub repo containing both `frontend/` and `backend/` as sibling folders, each with its own `package.json` (not an npm workspace unless later needed) — matches the user's original repo shape, just with NestJS instead of Express.
- **File storage**: local disk on the backend (`backend/uploads/`), served via a NestJS static-assets route or a dedicated controller endpoint.
- **Validation/forms**: Zod + React Hook Form on the frontend for form-level validation; NestJS's own validation (`class-validator`/`class-transformer` DTOs, its idiomatic approach) on the backend API boundary. Zod schemas are not shared across the process boundary since frontend and backend are now fully separate runtimes.
- **Module order after Employee Management**: Attendance → Leave → Performance Reviews (unchanged).
- **Testing**: manual, end-to-end testing per feature (Postman/Thunder Client + browser) — no automated test framework overhead up front.

---

## 1. Tech Stack

**Frontend** (`frontend/`):
- Next.js (App Router), React, TypeScript
- Tailwind CSS
- Redux Toolkit + Axios (calls the NestJS backend's REST API, cross-origin, with credentials)
- React Hook Form + Zod (client-side form validation only)

**Backend** (`backend/`):
- NestJS + TypeScript (REST controllers/services/modules)
- PostgreSQL (local instance) + TypeORM (entities, migrations, repository pattern via `@nestjs/typeorm`)
- Auth: `@nestjs/passport` + `passport-local` (credentials) + `passport-google-oauth20` (Google OAuth) + `@nestjs/jwt` (access/refresh tokens as httpOnly cookies)
- Validation: `class-validator` + `class-transformer` DTOs (NestJS idiomatic; Zod is not used backend-side)
- Password hashing: bcrypt

---

## 2. Repository & Project Structure

**Single GitHub repository**, two independent Node projects as sibling folders:

```
hrms-app/                              # single git repo
├── frontend/                          # Next.js app (UI only)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login|signup|forgot-password|reset-password/[token]/
│   │   │   └── (dashboard)/admin|supervisor|employee/...
│   │   ├── components/
│   │   ├── features/                  # Redux slices per domain
│   │   ├── lib/
│   │   │   ├── api.ts                   # Axios instance, baseURL = NEXT_PUBLIC_API_URL, withCredentials true
│   │   │   └── validation/              # Zod schemas (frontend-only, form validation)
│   │   ├── store/
│   │   ├── types/
│   │   └── middleware.ts               # reads auth cookie/role (via a lightweight call to backend or a decoded JWT) to gate routes
│   ├── .env.local                      # NEXT_PUBLIC_API_URL=http://localhost:4000
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
└── backend/                           # NestJS app (all REST APIs)
    ├── src/
    │   ├── main.ts                      # bootstraps Nest app, enables CORS for frontend origin + credentials
    │   ├── app.module.ts
    │   ├── config/                       # env validation/config module
    │   ├── database/
    │   │   ├── data-source.ts             # TypeORM data source (for CLI migrations)
    │   │   ├── entities/                  # User, Employee, Department, LeaveRequest, etc.
    │   │   └── migrations/
    │   ├── auth/
    │   │   ├── auth.module.ts, auth.controller.ts, auth.service.ts
    │   │   ├── strategies/                # local.strategy.ts, google.strategy.ts, jwt.strategy.ts
    │   │   └── guards/                    # jwt-auth.guard.ts, roles.guard.ts + roles.decorator.ts
    │   ├── users/                          # user/employee-adjacent shared logic
    │   ├── employees/
    │   ├── departments/
    │   ├── attendance/
    │   ├── leave/
    │   ├── notifications/
    │   ├── reviews/
    │   ├── dashboard/
    │   └── health/                        # GET /health — DB connectivity check
    ├── uploads/                            # local file storage, gitignored
    ├── .env
    ├── .env.example
    └── package.json
```

Notes:
- Each project runs as its own `npm run dev`/`start:dev` process on its own port (Next.js on 3000, NestJS on 4000 by convention) — no shared `node_modules`, no npm workspace, matching the user's preference for two genuinely independent projects.
- `backend/uploads/` replaces the earlier `frontend`-adjacent uploads idea — file storage now lives entirely on the backend, since that's the only process with a writable, long-lived local disk role.
- CORS must be explicitly enabled in NestJS (`app.enableCors({ origin: FRONTEND_URL, credentials: true })`) since frontend and backend are different origins in dev (`localhost:3000` vs `localhost:4000`).

---

## 3. Database Foundation (PostgreSQL + TypeORM) — entity design unchanged, now lives in `backend/`

Same entity set as before (entity design is framework-agnostic, so nothing about the schema changes, only which project hosts it):

`User`, `PasswordResetToken`, `Department`, `Employee`, `LeavePolicy`, `LeaveBalance`, `LeaveRequest`, `AttendanceRecord`, `PerformanceReviewCycle`, `PerformanceReview`, `Notification`.

- Connects to the existing local PostgreSQL instance (`hrms_dev` database, already created) via `backend/.env` (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`) — same credentials already in use, no Docker.
- TypeORM migrations (not `synchronize: true`), run from within `backend/` via its own npm scripts.
- `@nestjs/typeorm`'s `TypeOrmModule.forRootAsync` wires the same entities into Nest's DI system for use in services/repositories.

---

## 4. Restructuring Steps (one-time, before resuming the milestone roadmap)

Since Milestone 0 was already built and committed as a single Next.js app, this restructuring must happen before Milestone 1 can proceed:

1. Move the existing Next.js project (currently at repo root) into `frontend/`.
2. From `frontend/`, remove backend-only pieces: `src/app/api/**` (the health route), `src/lib/db/**` (TypeORM data-source/entities/migrations), and the now-unnecessary backend dependencies (`typeorm`, `pg`, `next-auth`, `bcryptjs`, `ts-node`, `dotenv-cli`, `reflect-metadata`) from its `package.json`. Keep Redux Toolkit, Axios, React Hook Form, Zod, Tailwind.
3. Scaffold a new NestJS project at `backend/` (via Nest CLI), add `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/passport`, `passport`, `passport-local`, `passport-google-oauth20`, `@nestjs/jwt`, `bcrypt`, `class-validator`, `class-transformer`.
4. Recreate the TypeORM data-source and entities directory inside `backend/src/database/`, reusing the exact schema design from the original plan (no entities existed yet beyond folder scaffolding, so this is a clean move).
5. Recreate the DB health check as a NestJS `HealthController` (`GET /health`) that runs a trivial query through the injected `DataSource`.
6. Update root `.gitignore` to cover both `frontend/node_modules`, `backend/node_modules`, `backend/uploads/`, both `.env*` sets, etc.
7. Verify both projects independently: `cd frontend && npm run dev` serves the UI on 3000; `cd backend && npm run start:dev` serves `/health` on 4000 with a working DB connection; a fetch from the frontend to `http://localhost:4000/health` succeeds (confirms CORS is configured correctly).
8. **Checkpoint** (left for the user to commit, per their stated preference): `refactor: split into frontend (Next.js) and backend (NestJS) projects`.

---

## 5. Feature Roadmap & Git Checkpoints (updated for Next.js + NestJS split)

Same order as before; each milestone now typically touches both projects (a NestJS module + controller on the backend, pages/Redux slice on the frontend).

### Milestone 1 — Database Foundation
- Backend: first TypeORM migration for `User` + `PasswordResetToken`
- **Verify**: migration run/revert against local Postgres via `backend`'s TypeORM CLI script.

### Milestone 2 — Authentication: Signup, Login, Logout
- Backend: `AuthModule` — `POST /auth/signup` (DTO validation, bcrypt hash), `POST /auth/login` (Passport local strategy, bcrypt compare, issues JWT access+refresh as httpOnly cookies), `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/me` (guarded by `JwtAuthGuard`)
- Frontend: signup/login pages (React Hook Form + Zod), Axios calls to backend with `withCredentials: true`, Redux `authSlice`, Axios response interceptor for 401 → refresh → retry, `middleware.ts` for protected routes
- **Verify**: full signup → login → protected page → refresh persists session → logout flow across both apps; invalid credentials and duplicate signup rejected.

### Milestone 3 — Forgot / Reset Password
- Backend: `POST /auth/forgot-password`, `POST /auth/reset-password/:token` (hashed token + expiry, dev SMTP email)
- Frontend: forgot/reset password pages
- **Verify**: as original plan.

### Milestone 4 — Google OAuth
- Backend: `GoogleStrategy` via `passport-google-oauth20`, `GET /auth/google`, `GET /auth/google/callback` — find-or-create `User`, issue same JWT cookies, redirect back to the frontend URL
- Frontend: "Sign in with Google" button linking to the backend's `/auth/google`
- **Verify**: new-user creation and existing-user login both work through the full redirect round trip.

### Milestone 5 — Roles & Permissions (RBAC)
- Backend: `role` embedded in JWT payload; `RolesGuard` + `@Roles()` decorator protect controllers/handlers
- Frontend: role-aware layout/nav, `middleware.ts` route guards per role segment
- Seed script (NestJS CLI command or a one-off script using the TypeORM data source) creates admin/supervisor/employee test users
- **Verify**: as original plan — correct dashboard per role, cross-role access blocked both at the API (403) and in the UI.

### Milestones 6–13 — Employee Management → Attendance → Leave → Notifications → Performance Reviews → Dashboards → Reports/Settings
Unchanged in scope and order from the original plan; each becomes a NestJS module (controller + service + entity/migration) paired with its Next.js pages/Redux slice. Verification steps per milestone are the same end-to-end manual checks as before (create/edit/search/filter, approval workflows, cross-role visibility, etc.) — see the prior plan revision for the full per-milestone detail, which still applies feature-by-feature, just re-homed onto NestJS controllers instead of Route Handlers.

---

## 6. Frontend Redux Structure — unchanged

One slice per domain: `auth`, `employees`, `departments`, `attendance`, `leave`, `notifications`, `reviews`, `dashboard`. Axios instance now points cross-origin at the NestJS backend instead of same-origin Route Handlers.

---

## 7. Authentication/OAuth Flow Summary (NestJS-owned)

1. Credentials login: frontend posts to `POST {backend}/auth/login` → Nest's local strategy validates via bcrypt against the TypeORM `User` repository → on success, Nest sets JWT access (~15 min) + refresh (~7 days) tokens as httpOnly, `SameSite=Lax` cookies on its own response (requires `credentials: true` CORS and the frontend's Axios using `withCredentials: true`).
2. Google login: frontend links to `GET {backend}/auth/google` → Google consent → Nest's Google strategy callback finds-or-creates the `User` by email/`googleId` → issues the same JWT cookies → redirects back to the frontend.
3. `role` is embedded in the JWT payload; a `RolesGuard` re-validates it server-side on every protected NestJS route — the frontend's role-based UI/middleware checks are UX-only.
4. Token refresh: Axios interceptor on 401 calls `POST {backend}/auth/refresh` (reads the refresh cookie), then retries the original request.

---

## 8. Testing Approach — unchanged

Manual, end-to-end per milestone: exercise NestJS endpoints via Postman/Thunder Client first, then full browser walkthroughs against both running dev servers.

---

## 9. Immediate Next Steps

1. Execute the one-time restructuring (Section 4) to split the existing single Next.js app into `frontend/` + a new `backend/` NestJS project.
2. Verify both dev servers run independently and the frontend can reach the backend's `/health` endpoint (CORS working).
3. Resume the milestone roadmap at Milestone 1 (Database Foundation) inside `backend/`.
