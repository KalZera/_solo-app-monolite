# backend — Solo Leveling System API

The API behind the Solo Leveling System app: a **Fastify 5** server on **Prisma 6 / PostgreSQL**,
organised with **domain-driven design** and an **event-driven** core.

## Architecture

Each bounded context lives under `src/domains/<domain>` and is split into the same four layers:

```
src/domains/<domain>/
├── api/              Fastify routes + Zod request schemas (the HTTP edge)
├── application/      use cases (one class per action — the orchestration)
├── domain/          entities, value objects, repository interfaces, pure rules
├── infrastructure/  Prisma repositories + in-memory repositories (used by tests)
└── tests/           Vitest unit tests (run against the in-memory repositories)
```

**Domains:** `identity` (auth/users) · `character` (the Hunter, stats, avatar, history) ·
`quest` (templates + per-period instances + objectives) · `progression` (XP / levels / rank) ·
`dashboard` · `notification` (in-app + WebSocket + Web Push).

**Cross-cutting infrastructure** (`src/infrastructure/`):

- `prisma/` — PrismaClient Fastify plugin.
- `jwt/` — access-token signing/verification + the `authenticate` preHandler.
- `events/` — an **event store** plus subscribers: `character-history-plugin` (turns domain events
  into the character's history feed) and `notification-dispatch-plugin`.
- `scheduler/` — cron plugins: quest **instance materialisation**, quest **expiration**, and quest
  **deactivation** (deadline → COMPLETED).
- `storage/` — Cloudflare **R2** (S3-compatible) avatar upload.
- `http/`, `logger/`, `cache/` — validation + global error handler, Pino logging, etc.

## API

All routes are versioned under **`/api/v1`**, plus a `GET /health`:

| Prefix | Domain |
| --- | --- |
| `/api/v1/identity` | register / login / refresh / logout / me / password / tutorial |
| `/api/v1/characters` | character CRUD, avatar upload, attribute allocation, history |
| `/api/v1/quests` | quest templates + instances (start / progress / complete / recurrence) |
| `/api/v1/quest-categories` | quest categories |
| `/api/v1/dashboard` | dashboard aggregates |
| `/api/v1/progression` | XP / level / rank |
| `/api/v1/notifications` | notifications (REST) + WebSocket feed |

**Auth:** short-lived **JWT access token** (Bearer) + an httpOnly **refresh cookie** scoped to
`/api/v1/identity`. Uploads are `multipart/form-data`, capped at 5 MB.

## Setup

```bash
npm install                 # (or from the monorepo root)
# create apps/backend/.env  — see the variables below
npm run db:migrate          # apply Prisma migrations to your database
npm run db:seed             # seed quest categories + the admin@admin.com / admin user
npm run dev                 # tsx watch — API on http://localhost:3333
```

### Environment variables (`.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://postgres:postgres@localhost:5432/solo_app_mvp`) |
| `PORT` / `HOST` | Listen port (default `3333`) / host (default `0.0.0.0`) |
| `NODE_ENV` | `development` / `production` (drives secure-cookie behaviour) |
| `JWT_SECRET` | Secret for signing access/refresh tokens |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Cloudflare R2 avatar storage |
| `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Web Push (VAPID) keys |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | `tsx watch src/server.ts` |
| `npm run build` / `npm start` | `tsc` → `dist/` / run `dist/server.js` |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm test` | Vitest (unit tests over the in-memory repositories) |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:studio` | `prisma studio` |
| `npm run db:seed` | `tsx prisma/seed.ts` |

## Testing

Use cases are tested with **Vitest** against **in-memory repositories** (`InMemory*Repository`), so
the suite needs no database. Run `npm test`.

## Migrations convention

Migrations under `prisma/migrations/` are frequently **hand-authored** (this repo has often run
without a live database). Each such file carries a note to regenerate/verify with
`prisma migrate dev` against a real database before release, and the schema and the migration SQL
are kept in sync by hand. After changing `prisma/schema.prisma`, run `npm run db:generate` so the
Prisma Client types pick up the change.
