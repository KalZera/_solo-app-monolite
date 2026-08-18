# Solo Leveling System — Monorepo

A gamified productivity / habit-tracking app themed after *Solo Leveling*. You are a **Hunter**,
your tasks are **Quests** with a difficulty **rank (E → S)**, and completing them grants **XP**,
**levels**, **ranks** and **attribute points** for your character. "The System" is the in-app voice
that narrates your progress. Fully bilingual (🇧🇷 pt / 🇺🇸 en).

## Repository layout

```
.
├── apps/
│   ├── backend/            Fastify 5 + Prisma 6 (PostgreSQL) API — DDD, event-driven
│   └── frontend-refactor/  Expo SDK 57 universal app (iOS / Android / Web) — the client
├── packages/
│   └── shared-types/       @repo/shared-types — tiny cross-cutting TS types (ID, Paginated, …)
├── ADRs/                   Architecture Decision Records (ADR-001 … ADR-006)
├── docs/                   business_rules.md, domains.md, BACKLOG.md, audits
└── PROJECT_GUARDRAILS.md   engineering conventions for the repo
```

| Workspace | Stack | README |
| --- | --- | --- |
| `apps/backend` | Fastify · Prisma · PostgreSQL · DDD | [apps/backend/README.md](apps/backend/README.md) |
| `apps/frontend-refactor` | Expo SDK 57 · expo-router · NativeWind | [apps/frontend-refactor/README.md](apps/frontend-refactor/README.md) |

## Tooling

npm **workspaces** + **Turborepo** — one install at the root wires up every app and package, and the
root scripts fan a task out across all of them.

## Prerequisites

- **Node.js ≥ 20**, npm 10+
- **PostgreSQL 14+** (for the backend)
- **Expo Go** app or an emulator/simulator (to run the frontend on a device)

## Quick start

```bash
# 1. Install all workspaces (backend + frontend-refactor + packages)
npm install

# 2. Backend: configure env + database (see apps/backend/README.md)
cd apps/backend
# create .env with DATABASE_URL, JWT_SECRET, … (full list in apps/backend/README.md)
npm run db:migrate              # apply Prisma migrations
npm run db:seed                 # seed base data + the admin@admin.com / admin user
npm run dev                     # API on http://localhost:3333

# 3. Frontend (in another terminal)
cd ../frontend-refactor
# set EXPO_PUBLIC_API_URL in .env (LAN IP for a physical device)
npm run dev                     # Expo dev server (press w for web, i for iOS, a for Android)
```

## Root scripts (Turborepo — run across workspaces)

| Command | Description |
| --- | --- |
| `npm run dev` | Start every workspace's dev task in parallel |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run type-check` | `tsc --noEmit` across all workspaces |
| `npm run test` | Run all test suites |
| `npm run db:generate` / `db:migrate` / `db:studio` | Proxy to the backend's Prisma scripts |

## Documentation

- **`PROJECT_GUARDRAILS.md`** — coding conventions and guardrails for contributors.
- **`ADRs/`** — the "why" behind key decisions (auth, quest recurrence, deadlines, …).
- **`docs/business_rules.md`** & **`docs/domains.md`** — domain rules and bounded contexts.
