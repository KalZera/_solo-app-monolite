# Solo Leveling System — Frontend (refactor)

Reescrita do frontend inspirada no manhwa **Solo Leveling**, com **Expo Router**
(foco em web, compatível com iOS/Android), **NativeWind**, **Zustand**,
**React Query**, **React Hook Form**, **Zod** e **i18n**. Sem `axios` — apenas
`fetch`.

## Stack

| Área          | Escolha                                                        |
| ------------- | ------------------------------------------------------------- |
| Navegação     | Expo Router (typed routes)                                    |
| UI            | React Native + React Native Web + **NativeWind** (Tailwind)  |
| Estado global | **Zustand** (sessão, toasts)                                  |
| Estado server | **React Query**                                              |
| Formulários   | **React Hook Form** + **Zod** (schema factory recebendo `t`) |
| HTTP          | `fetch` (cliente próprio com refresh single-flight)          |
| i18n          | i18next / react-i18next (`en`, `pt`) — reaproveitado         |
| Fonte         | **Rajdhani** (default, via `@expo-google-fonts/rajdhani`)    |

## Rodando

```bash
npm run dev      # expo start
npm run web      # expo start --web
npm run build    # expo export --platform web
npm run type-check
npm run lint
npm run format
```

Variável de ambiente: `EXPO_PUBLIC_API_URL` (padrão `http://localhost:3333/api/v1`).

## Arquitetura (DDD light + Clean Architecture)

Cada domínio em `src/modules/<feature>/` segue camadas:

```
modules/<feature>/
├── domain/          # tipos + regras puras (sem framework)
├── infrastructure/  # requests fetch, mappers, mocks
├── application/     # casos de uso: hooks React Query + stores Zustand
├── presentation/    # screens/ + components/ (+ hooks/ específicos)
└── schemas/         # Zod (factory recebendo t() do i18n)
```

Transversais em `src/shared/`: `api` (http-client fetch + query-client),
`components` (design system — `Button`, `Panel`, `Input`, `Loading`, `Toast`,
`SystemNotice`, …), `notifications` (store + `ToastHost`), `i18n`, `storage`,
`stores`, `theme`, `hooks`, `utils`, `config`.

Rotas (`app/`) são finas: apenas importam e renderizam a screen do módulo.

```
app/
├── _layout.tsx            # providers, fontes, bootstrap de sessão, guard
├── index.tsx              # redirect
├── login.tsx / register.tsx        (públicas)
├── onboarding.tsx         # criação de character (autenticado, sem character)
└── (tabs)/                # bottom bar: dashboard · quests · history · profile
    ├── dashboard.tsx
    ├── quests/  (index + new)
    ├── history.tsx
    └── profile/ (index + avatar)
```

O `(tabs)/_layout` funciona como **gate de onboarding**: consulta o character e,
se o backend responde `404` (sem character), redireciona para `/onboarding`.
Outros erros (offline, 5xx) não bloqueiam o acesso às abas.

## Segurança (preservada)

- Access token JWT em `expo-secure-store` (native) / `localStorage` (web).
- Refresh token em cookie **httpOnly** (nunca no JS); requests usam
  `credentials: 'include'`.
- Refresh **single-flight** com retry automático no `401` e logout forçado
  quando o refresh falha (`shared/api/http-client.ts` + `session.store.ts`).
- Refresh silencioso a cada 10 min enquanto autenticado.

## Real vs. mockado

- **Real (contrato do backend):** login/registro/refresh/logout, **criação de
  character** (`POST /characters/` — onboarding), quests
  (`POST/GET /quests` — rank → XP derivado no servidor) e o **ciclo de execução
  por instância** (`GET /quests/today`, `.../instances/:id/start` · `/complete`
  · `/progress`) na tela de detalhe, perfil e upload de avatar (`/characters`,
  `/characters/avatar`).
- **Mockado (backend futuro):** dashboard e histórico (dados em
  `infrastructure/*.mock.ts`; troque apenas o hook em `application/` para ligar
  ao backend). Telas mockadas exibem um aviso `SystemNotice`.

> Ao autenticar sem um character, o gate leva o Caçador ao **onboarding** para
> criá-lo. Com o character criado, o acesso às abas (e a criação de quests) é
> liberado.

## Convenções de lint

`eslint-config-expo` + Prettier, com:

- **Nenhum arquivo acima de 250 linhas** (`max-lines`).
- **Imports não utilizados removidos** (`unused-imports`).
- Formatação via Prettier como erro de lint (`npm run lint` / `lint:fix`).
