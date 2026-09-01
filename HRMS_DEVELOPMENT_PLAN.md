# HRMS Full-Stack Build Plan

## Context

This is a greenfield learning/portfolio project (`d:\hrms-app` is currently empty, no git repo). The goal is a full-stack Human Resource Management System with three roles (Admin/HR, Supervisor/Manager, Employee).

**Revision note**: The original plan used a separate Express backend + Next.js frontend as two independent projects. The user has since decided to simplify: **Express is removed entirely**, and **Next.js serves as both frontend and backend**, using Next.js Route Handlers (API routes) for all server-side logic. This collapses the project into a single Next.js application, in a single GitHub repository, connecting to a **local PostgreSQL instance the user already has installed** (no Docker). The feature-by-feature build order and Git-checkpoint discipline from the original plan are unchanged — only the architecture and repo layout are updated.

Key decisions (updated):
- **Architecture**: One Next.js app (App Router) — UI pages and API routes live in the same project. No Express, no separate backend server/process.
- **Auth**: NextAuth.js (Auth.js) with the Credentials provider (bcrypt-hashed passwords + TypeORM lookup) and the Google provider for OAuth. Sessions via NextAuth's JWT strategy (httpOnly cookies, managed by NextAuth).
- **Database**: PostgreSQL (already installed locally) + TypeORM for entities/migrations, connected via environment variables — no Docker.
- **Repository**: Single GitHub repo, single Next.js project (no separate `frontend/`/`backend/` folders — see structure below).
- **File storage**: local disk (`public/uploads/` or a server-only `uploads/` folder), served via a Route Handler or Next's static file serving.
- **Validation/forms**: Zod schemas + React Hook Form (`@hookform/resolvers/zod`) on the frontend; the same Zod schemas reused for server-side validation in Route Handlers.
- **Module order after Employee Management**: Attendance → Leave → Performance Reviews (unchanged).
- **Testing**: manual, end-to-end testing per feature (Postman/Thunder Client + browser) — no automated test framework overhead up front.

---

## 1. Tech Stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **State management**: Redux Toolkit (client-side UI/domain state), Axios (HTTP calls from client components to the app's own Route Handlers)
- **Auth**: NextAuth.js / Auth.js — Credentials provider (email+password) and Google provider (OAuth)
- **Database**: PostgreSQL (local instance already installed)
- **ORM/migrations**: TypeORM
- **Validation**: Zod (shared schemas for forms and API route input validation)
- **Forms**: React Hook Form + `@hookform/resolvers/zod`
- **Password hashing**: bcrypt (only for Credentials-provider users; Google OAuth users have no local password)

---

## 2. Repository & Project Structure

**Single GitHub repository, single Next.js project** — no separate frontend/backend apps or folders:

```
hrms-app/                          # single Next.js app, single git repo
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/[token]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/...
│   │   │   ├── supervisor/...
│   │   │   └── employee/...
│   │   └── api/                     # Route Handlers = "backend"
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts     # NextAuth handler (session, Google OAuth, credentials)
│   │       │   ├── signup/route.ts
│   │       │   ├── forgot-password/route.ts
│   │       │   └── reset-password/[token]/route.ts
│   │       ├── employees/route.ts, [id]/route.ts
│   │       ├── departments/route.ts, [id]/route.ts
│   │       ├── attendance/check-in/route.ts, check-out/route.ts, me/route.ts, team/route.ts
│   │       ├── leave/policies/route.ts, requests/route.ts, requests/[id]/route.ts, balance/me/route.ts
│   │       ├── notifications/route.ts, [id]/read/route.ts
│   │       ├── reviews/cycles/route.ts, [id]/route.ts
│   │       ├── dashboard/admin/route.ts, supervisor/route.ts, employee/route.ts
│   │       └── uploads/[...path]/route.ts        # serves local uploaded files
│   ├── components/                    # shared UI components
│   ├── features/                      # Redux slices, grouped by domain
│   ├── lib/
│   │   ├── db/                          # TypeORM data-source, entities, migrations
│   │   │   ├── data-source.ts
│   │   │   ├── entities/
│   │   │   └── migrations/
│   │   ├── auth/                        # NextAuth config (authOptions), password hashing helpers
│   │   ├── validation/                  # Zod schemas, shared client+server
│   │   ├── axios.ts                     # Axios instance (baseURL relative, withCredentials true)
│   │   └── utils/
│   ├── store/                          # Redux store config
│   ├── types/
│   └── middleware.ts                   # role-based route protection (reads NextAuth session/JWT)
├── uploads/                            # local file storage, gitignored (server-only, outside public/ for access control)
├── .env.local                          # DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, etc.
├── .env.example
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

Notes:
- Route Handlers under `src/app/api/**` are the entire "backend" — no separate server process, no separate `package.json`.
- `src/lib/db` holds TypeORM setup; Route Handlers import a shared, singleton data-source (important in Next.js dev mode to avoid re-creating connections on hot reload).
- Uploaded files are kept outside `public/` and served through a Route Handler so access can be gated by session/role later if needed (e.g., private documents); profile photos that are safe to be public can instead go in `public/uploads/` for simplicity — decide per-file-type at Milestone 6.

---

## 3. Database Foundation (PostgreSQL + TypeORM) — unchanged from original plan

Same entity set as before, unaffected by the Express removal (TypeORM entities/migrations are framework-agnostic):

`User`, `PasswordResetToken`, `Department`, `Employee`, `LeavePolicy`, `LeaveBalance`, `LeaveRequest`, `AttendanceRecord`, `PerformanceReviewCycle`, `PerformanceReview`, `Notification`.

- Connects to the **local PostgreSQL instance** via a `DATABASE_URL` (or discrete `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`) environment variable in `.env.local`. No Docker, no containerized Postgres.
- TypeORM migrations (not `synchronize: true`) from day one, run via an npm script (`npm run typeorm -- migration:run`) against the local instance.
- Tables are still created incrementally per milestone (migration per feature), same as the original plan.

---

## 4. Feature Roadmap & Git Checkpoints (updated for Next.js-only architecture)

Same order and verification discipline as the original plan; implementation details updated to Route Handlers + NextAuth.

### Milestone 0 — Project Setup
- `create-next-app` (TypeScript, Tailwind, App Router, ESLint) as the single project
- Install TypeORM + `pg`, Redux Toolkit, Axios, NextAuth, Zod, React Hook Form, bcrypt
- Set up `src/lib/db/data-source.ts` (singleton pattern for Next.js hot-reload), `.env.local`/`.env.example` with local Postgres connection vars
- Health-check Route Handler: `GET /api/health` (verifies DB connectivity)
- Redux store shell, Axios instance, base layout, Tailwind config
- Single git repo init, `.gitignore` (node_modules, .env*, uploads/, .next/)
- **Checkpoint**: `chore: initial Next.js project scaffolding with TypeORM and Redux`
- **Verify**: `npm run dev` starts the app; `/api/health` returns DB-connected status; default page renders with Tailwind styles applied.

### Milestone 1 — Database Foundation
- First TypeORM migration for `User` + `PasswordResetToken` against the local Postgres DB
- Verify migration run/revert
- **Checkpoint**: `feat(db): set up TypeORM and initial user schema/migration`
- **Verify**: migration creates tables in local `psql`; revert cleanly drops them.

### Milestone 2 — Authentication: Signup, Login, Logout
- NextAuth config (`src/lib/auth/authOptions.ts`) with Credentials provider (bcrypt compare against `User.passwordHash`, TypeORM lookup), JWT session strategy
- Route Handlers: `POST /api/signup` (Zod validation, bcrypt hash, create `User`), NextAuth's built-in `/api/auth/[...nextauth]` handles login/logout/session
- Frontend: signup/login pages using React Hook Form + Zod resolver, NextAuth's `signIn()`/`signOut()`/`useSession()`, Redux `authSlice` synced from session where needed, `middleware.ts` for protected-route redirects based on session
- **Checkpoint**: `feat(auth): signup, login, logout via NextAuth credentials provider`
- **Verify**: signup → login → access protected page → refresh page (session persists) → logout → redirected from protected page. Test invalid credentials and duplicate signup.

### Milestone 3 — Forgot / Reset Password
- Route Handlers: `POST /api/forgot-password` (generate + hash token, store with expiry, send email via dev SMTP catcher e.g. Ethereal), `POST /api/reset-password/[token]` (validate token/expiry, update password hash, invalidate token)
- Frontend: forgot-password and reset-password/[token] pages
- **Checkpoint**: `feat(auth): forgot and reset password flow`
- **Verify**: request reset → dev email link → set new password → log in with new password; expired/invalid token rejected.

### Milestone 4 — Google OAuth
- Add Google provider to NextAuth config (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in `.env.local`); NextAuth's `signIn`/callback link Google identity to `User` by email or `googleId`, defaulting role to `employee` on first login
- Frontend: "Sign in with Google" button using NextAuth's `signIn('google')`
- **Checkpoint**: `feat(auth): google oauth via nextauth`
- **Verify**: Google sign-in creates a new user on first login and logs in an existing user (matched by email) on subsequent logins.

### Milestone 5 — Roles & Permissions (RBAC)
- Store `role` in the NextAuth JWT/session via callbacks (`jwt`, `session`)
- `middleware.ts` protects `(dashboard)/admin`, `/supervisor`, `/employee` segments by role; Route Handlers re-check role server-side from the session (never trust client-only checks)
- Seed script (a one-off TypeORM script) creates one admin, one supervisor, one employee for manual testing
- **Checkpoint**: `feat(rbac): role-based route and API protection`
- **Verify**: log in as each seeded role; correct dashboard shown; cross-role pages/API calls return 403/redirect.

### Milestone 6 — Employee Management (Admin/HR)
- Migration for `Department`, `Employee`
- Route Handlers: CRUD for departments and employees (create employee = create `User` + `Employee` together), list with pagination/search/filter, profile photo upload (handled via a Route Handler reading `multipart/form-data`, written to local `uploads/`)
- Frontend: admin employee list/detail/create/edit, department management, supervisor read-only team view, employee self-profile view/edit
- **Checkpoint**: `feat(employees): department and employee CRUD with profile management`
- **Verify**: same as original plan — create/edit/search/filter as admin, restricted views for employee/supervisor, uploaded photo renders correctly.

### Milestone 7 — Attendance
- Migration for `AttendanceRecord`
- Route Handlers: check-in/check-out, self/team/all history with filters, admin correction
- Frontend: check-in/out widget, personal history, team view, admin report view
- **Checkpoint**: `feat(attendance): check-in/out and attendance views per role`
- **Verify**: as original plan.

### Milestone 8 — Leave Management
- Migration for `LeavePolicy`, `LeaveBalance`, `LeaveRequest`
- Route Handlers: policy CRUD, balance allocation, apply/approve/reject, auto-deduct balance, sync `AttendanceRecord` to `on-leave` on approval
- Frontend: application form + balance + history, supervisor approval queue, admin policy management
- **Checkpoint**: `feat(leave): leave policies, balances, requests, and approval workflow`
- **Verify**: as original plan.

### Milestone 9 — Notifications
- Migration for `Notification`
- Route Handlers emit notifications on leave events; `GET /api/notifications`, mark-as-read
- Frontend: notification bell with polling
- **Checkpoint**: `feat(notifications): in-app notifications for leave events`
- **Verify**: as original plan.

### Milestone 10 — Performance Reviews
- Migration for `PerformanceReviewCycle`, `PerformanceReview`
- Route Handlers: cycle management, self/manager review submission, status transitions
- Frontend: cycle admin UI, self-review form, manager review form, combined view
- **Checkpoint**: `feat(performance): review cycles and self/manager review workflow`
- **Verify**: as original plan.

### Milestone 11 — Dashboards
- Route Handlers: per-role aggregate endpoints
- Frontend: role-specific dashboard widgets
- **Checkpoint**: `feat(dashboard): role-specific summary dashboards`
- **Verify**: as original plan.

### Milestone 12 — Global Search / Filtering & Reports
- Route Handlers: employee search, CSV export for leave/attendance reports
- Frontend: search bar, report filters + CSV download
- **Checkpoint**: `feat(reports): global search and CSV report export`
- **Verify**: as original plan.

### Milestone 13 — Settings
- Org settings (working days, holiday calendar), user settings (change password, notification preferences)
- **Checkpoint**: `feat(settings): org and user-level settings`
- **Verify**: as original plan.

---

## 5. Frontend Redux Structure — unchanged

One slice per domain under `src/features/<domain>/<domain>Slice.ts`: `employees`, `departments`, `attendance`, `leave`, `notifications`, `reviews`, `dashboard`. `auth` state is largely driven by NextAuth's `useSession()`; a thin `authSlice` may still exist for UI-only auth state (e.g., form status) rather than duplicating session data.

RTK Query vs. thunks+Axios decision still made concretely at Milestone 2, when the first slice pattern is established.

---

## 6. Authentication/OAuth Flow Summary (NextAuth-based)

1. Credentials login: `signIn('credentials', {...})` → NextAuth's authorize callback looks up `User` via TypeORM, compares bcrypt hash → on success, NextAuth issues its JWT session cookie (httpOnly).
2. Google login: `signIn('google')` → OAuth redirect/consent → NextAuth's Google provider callback finds-or-creates the `User` by email/`googleId` → same JWT session cookie issued.
3. `role` is embedded into the token via NextAuth's `jwt` callback and exposed on the client via the `session` callback; Route Handlers re-derive the session server-side (`getServerSession`/`auth()`) and re-check role before performing any mutation — client-side role checks are UX-only.
4. `middleware.ts` uses NextAuth's session/JWT to gate access to role-specific route segments at the edge, before the page even renders.
5. Axios instance in `src/lib/axios.ts` calls same-origin `/api/*` routes with credentials included automatically (same-origin cookies) — no manual token attachment needed, since NextAuth manages the session cookie.

---

## 7. Testing Approach — unchanged

Manual, end-to-end testing per milestone: exercise Route Handlers directly (Postman/Thunder Client/`.http` file) before wiring the frontend, then full browser walkthroughs per each milestone's "Verify" step. No automated test framework for now.

---

## 8. Immediate Next Steps

1. Confirm local PostgreSQL connection details (host/port/user/db name) to populate `.env.example` accurately.
2. Confirm Google OAuth app credentials are available (or will be created) for Milestone 4 — not needed until then.
3. Begin Milestone 0 (single Next.js app scaffolding) once this plan is approved.
