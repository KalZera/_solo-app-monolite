# frontend — Solo Leveling System app

The primary client for the Solo Leveling System: a **universal Expo app** (iOS · Android · Web) built
on **Expo SDK 57** (React Native 0.86, React 19.2) with file-based routing and a modular,
feature-first architecture.

## Stack

- **Expo SDK 57** + **expo-router** (file-based routes in `app/`, typed routes enabled)
- **NativeWind 4** + **Tailwind CSS 3** for styling (`className` on native)
- **@tanstack/react-query** (server state) + **Zustand** (session / UI stores)
- **react-hook-form** + **zod** (forms & validation)
- **i18next / react-i18next** — bilingual **pt** / **en** (`src/shared/i18n/locales`)
- **lucide-react-native** icons, **Rajdhani** font (`@expo-google-fonts/rajdhani`)
- Auth tokens in **expo-secure-store**; httpOnly refresh cookie + silent refresh

## Project structure

```
app/                         expo-router routes (the navigation tree)
├── _layout.tsx              root: providers + auth-gated Stack
├── login / register / onboarding
└── (tabs)/                  dashboard · character · quests · history · profile

src/
├── modules/<feature>/       one folder per feature, each split into:
│   ├── application/          hooks / stores / query keys
│   ├── domain/               types & pure rules
│   ├── infrastructure/       HTTP requests
│   └── presentation/         screens & components
│   └── …  auth · dashboard · history · notification · profile · quest · tutorial
└── shared/                  api (http-client), components (design system), config,
                             i18n, theme, storage, notifications, level-up, utils
```

## Setup & run

```bash
npm install                  # (or from the monorepo root)

# Point the app at the backend. For a physical device use your machine's LAN IP, not localhost:
#   .env  →  EXPO_PUBLIC_API_URL=http://<lan-ip>:3333/api/v1
npm run dev                  # Expo dev server — press w (web) · i (iOS) · a (Android)
```

The backend must be running (see `apps/backend`). Seed login: **`admin@admin.com` / `admin`**.

### Environment variables (`.env`, `EXPO_PUBLIC_*` are inlined into the client)

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Backend base URL incl. `/api/v1` (falls back to a LAN default in `src/shared/config/env.ts`) |
| `EXPO_PUBLIC_VAPID_PUBLIC_KEY` | Public VAPID key for Web Push (web only; empty disables it) |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | `expo start` |
| `npm run ios` / `android` / `web` | Start targeting a platform |
| `npm run build` | `expo export` static web build → `dist/` |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint (`--max-warnings=0`; `max-lines: 250` per file) |
| `npm run format` | Prettier over `app/` + `src/` |

## Conventions

- **One file ≤ 250 lines** (enforced by ESLint) — screens compose small presentational components.
- All user-facing text goes through `t('…')`; add keys to **both** `pt.json` and `en.json`.
- Styling is `className`-first (NativeWind); the palette/typography live in `tailwind.config.js`
  and are mirrored for non-className APIs in `src/shared/theme/colors.ts`.

## Related

`apps/frontend-mobile` is a port of this app pinned to **Expo SDK 54** for testing in **Expo Go on
iOS**. It shares the same `app/` + `src/`; only dependency versions differ. See its README.
