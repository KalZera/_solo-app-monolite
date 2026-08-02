# PROJECT_GUARDRAILS.md

> **Contrato arquitetural do projeto Solo Leveling (MVP).**
> Este documento codifica os padrões **já existentes** no código (não inventa arquitetura).
> Qualquer novo desenvolvedor **ou IA** deve conseguir contribuir seguindo este contrato
> **sem alterar a arquitetura**. Alterações arquiteturais só via **novo ADR aprovado**.
>
> Fontes: `ADRs/ADR-001`, `ADRs/ADR-002`, `docs/domains.md`, `docs/business_rules.md`,
> `docs/AUDIT_REPORT.md`. Referência de código em `arquivo:linha`.

---

## Objetivo do projeto

Transformar metas e atividades do mundo real em uma experiência de **progressão tipo RPG**
(inspirada em Solo Leveling): o usuário evolui um **personagem** ao concluir **quests**
ligadas a seus objetivos. O foco é **progressão contínua e retenção**, não produtividade
(`docs/domains.md`).

## Visão do produto

- Incentivar consistência e criar sensação de evolução (XP, level, atributos, rank).
- Um **usuário** possui exatamente **um personagem**; toda quest pertence a um personagem.
- **XP nunca é concedido diretamente pela quest** — quem concede é o **Progression Engine**
  (`docs/domains.md` › Regras Gerais).
- MVP mobile-first (React Native + Expo), backend monólito modular.

## Arquitetura adotada

- **Monólito modular DDD** (ADR-001), Clean Architecture com dependências apontando para dentro.
- **Backend:** Fastify 5 + Prisma 6 + PostgreSQL. Camadas por domínio:
  `api → application → domain → infrastructure`.
- **Frontend:** Expo Router (React Native 0.86 + RN Web) + Tamagui + React Query (ADR-002).
- **Eventos:** event bus in-memory (`shared/events/domain-event.ts`) + event store
  (`infrastructure/events/event-store-plugin.ts`).
- **Monorepo:** Turborepo (`apps/*`, `packages/*`).

## Estrutura dos módulos

**Backend — cada domínio segue exatamente esta estrutura:**

```
domains/<domínio>/
├── api/            routes.ts (Fastify) — HTTP, auth, composição do use case
├── application/    <use-case>.ts — 1 caso de uso por arquivo, classe com execute()
├── domain/         entidades, tipos, regras puras, events.ts (fábricas de evento),
│                   e a INTERFACE do repositório (ex.: QuestRepository)
├── infrastructure/ prisma-<x>-repository.ts + in-memory-<x>-repository.ts
└── tests/          <use-case>.test.ts (Vitest, repos in-memory)
```

Domínios atuais: `identity`, `character`, `quest`, `progression`. Motores em
`progression/engines/*` (funções/classe **puras**, sem I/O).

**Frontend — cada feature segue:**

```
modules/<feature>/
├── api/       use<Recurso>.ts (React Query) + <recurso>.requests.ts (axios)
├── components/ *.tsx apresentacionais
├── schemas/   *.schema.ts (Zod, factory recebendo t() do i18n)
├── screens/   <Feature>Screen.tsx
└── (session/, engine/, types.ts conforme necessário)
```

Transversais em `shared/` (api, components `System*`, i18n, notifications, storage, theme).

---

## Padrões obrigatórios

1. **Dependency Inversion:** use cases dependem de **interfaces** de repositório (no `domain/`),
   nunca de Prisma direto. Toda interface tem impl `prisma-*` **e** `in-memory-*`.
2. **1 use case por arquivo**, classe com construtor injetando dependências e método
   `execute(input)` tipado. Ex.: `create-quest.ts`.
3. **Ownership sempre derivada do token** (`req.user.sub`) — **nunca** confie em `userId`/
   `characterId` do body (`character/api/routes.ts:31`).
4. **Erros de domínio** via hierarquia `AppError` (`shared/errors/app-error.ts`):
   `NotFound/Unauthorized/Forbidden/Conflict/Validation`. Nada de `throw new Error` cru em
   use case/rota.
5. **Eventos como funções-fábrica** tipadas `create<Nome>Event(...)` implementando
   `DomainEvent` (`eventId, eventType, occurredAt, aggregateId`). Publicação via
   `publishEvent` **injetável** (default `eventBus.publish`) para testabilidade.
6. **Regras de negócio ficam no `domain/`** (funções puras) — não nos controllers nem nos
   repositórios. Ex.: `calculateObjectivesCompletionRatio`, engines de progressão.
7. **Nenhuma regra de negócio inventada.** Se uma regra não existe em `business_rules.md`,
   **documentar primeiro**, depois implementar.

---

## Regras para Frontend

- **Estado de servidor** exclusivamente via **React Query** (hooks `use*` em `api/`). Não
  duplicar cache manual.
- **Sessão/auth** via `SessionProvider` + `http-client` (interceptors de Bearer e refresh
  single-flight). Não criar outro fluxo de token.
- **Formulários:** React Hook Form + Zod (`@hookform/resolvers`), schema como factory que
  recebe `t()` (i18n).
- **Toda tela** trata **loading, empty e error** (padrão de `HomeScreen.tsx`). Textos via
  i18n (`react-i18next`), nunca hardcoded.
- **UI** com componentes Tamagui e o design system `System*`/`FormField`/`ProgressBar`.
- **Não recalcular no cliente** regras que o servidor já resolve (nível/XP/rank vêm do
  `get-character-profile`). Cálculo client-side apenas como previsão/otimista e usando a
  **mesma** fonte do backend.
- Storage de token via `shared/storage/token-storage.ts` (SecureStore no native).

## Regras para Backend

- **Toda rota** de negócio usa `preHandler:[app.authenticate]`. Exceções (register/login/
  refresh/logout) são explícitas e revisadas.
- **Validar toda entrada** (body/params/query) **antes** do use case — schema por rota.
  (Padrão-alvo; ver CARD-102. É proibido introduzir novas rotas sem validação.)
- Rotas **compõem** repositórios + use case e traduzem HTTP; **sem regra de negócio na rota**.
- **Retornos**: `201` em create, `204` em delete, corpo JSON serializável.
- **`app.setErrorHandler(errorHandler)`** deve estar ativo; nunca vazar erro interno em 500.
- **Operações multi-passo** usam `prisma.$transaction`; publicar eventos **após** commit.
- Não acessar `process.env` espalhado — centralizar leitura/validação de env no boot.

## Regras para Banco

- **Prisma é o único ORM** (ADR-001). Migrations versionadas e revisadas; nunca editar o banco
  fora de migration.
- **Snake_case** nas colunas via `@map`; `@@map` nas tabelas (plural). PK `uuid` (`@default(uuid())`).
- **Relações** devem declarar `onDelete` (Cascade ou soft delete) — nada de FK “solta”.
- **Índices** (`@@index`) em toda coluna usada em filtro/join (ex.: `characterId`, `userId`, `status`).
- `createdAt`/`updatedAt` padrão (`@default(now())`/`@updatedAt`).
- **Fonte de verdade única** para um dado (evitar duplicar `level/experience` entre modelos).

## Regras para Eventos

- Nome do evento = `PascalCase` (`QuestCompleted`, `LevelUp`); `eventType` literal no tipo.
- Fábrica em `domain/events.ts` do domínio dono do agregado.
- **Efeitos colaterais** ficam em **consumers** (`infrastructure/events/*-plugin.ts`), não no
  publisher, **exceto** integrações já existentes documentadas em ADR.
- Todo evento é persistido pelo `event-store-plugin` (`subscribeToAll`). Não remover essa
  captura.
- Publicar evento **não** deve mascarar falha de negócio; em fluxo transacional, publicar após
  commit. Consumers devem ser idempotentes.
- Evento novo precisa de: fábrica tipada, publisher, consumer (ou justificativa de “só store”),
  e teste de publicação.

## Regras para Segurança

- **Senhas** com bcrypt (`shared/security/password.ts`). Nunca logar/serializar `passwordHash`.
- **JWT** com `type` `access`/`refresh` sempre verificado; refresh em cookie **httpOnly**,
  `secure`/`sameSite` por ambiente, path restrito.
- **Autorização por dono**: recursos escopados ao `req.user.sub`. Sem IDOR.
- **Anti mass-assignment**: use cases aceitam **apenas** campos permitidos; nunca `...req.body`
  direto para atributos sensíveis (stats/level/powerScore/status).
- **Uploads**: allowlist de MIME, limite de tamanho, chave derivada do dono.
- **Segredos** só via env; `.env` nunca versionado; `.env.example` mantido atualizado.
- CORS com allowlist por ambiente; rate limit em rotas de auth.

## Regras para Infraestrutura

- **Turbo** orquestra `build/lint/type-check/test/db:*`. Todo pacote expõe esses scripts.
- **Node 20+**, `npm` workspaces. Postgres via `apps/backend/docker-compose.yml` no dev.
- **CI obrigatório** (lint + type-check + test) antes de merge (ver CARD-004).
- Jobs agendados (`node-cron`) devem ser **idempotentes** e seguros para múltiplas instâncias.
- Deploy por container (multi-stage), rodando `prisma migrate deploy` no start.

---

## Convenções

- **Idioma:** código, identificadores e comentários em **inglês**; docs de produto podem ser
  PT/EN. Mensagens de UI via i18n.
- **Comentários** explicam o **porquê** (regra de negócio), não o óbvio — seguir o padrão atual.
- **Imports** relativos dentro do domínio; cross-domain só por interface/tipo público.
- **Sem** números mágicos: constantes nomeadas no `domain/` (ex.: `MAX_ACTIVE_DAILY_QUESTS`).
- Lint/format: `@rocketseat/eslint-config` + `neostandard` (backend), `eslint-config-expo`
  (frontend). Sem `;` no backend (padrão neostandard).

## Padrões de nomenclatura

| Item | Padrão | Exemplo |
|------|--------|---------|
| Arquivo de use case | kebab-case, verbo-substantivo | `complete-quest.ts` |
| Classe de use case | PascalCase + `UseCase` | `CompleteQuestUseCase` |
| Interface de repo | PascalCase + `Repository` | `QuestRepository` |
| Impl de repo | `prisma-`/`in-memory-` + `-repository` | `prisma-quest-repository.ts` |
| Engine | `<x>.engine.ts` / função `calculate*`/`apply*` | `level.engine.ts` |
| Evento (tipo/fábrica) | `PascalCase` / `create<Nome>Event` | `createLevelUpEvent` |
| Hook FE | `use<Recurso>` | `useCharacterProfile` |
| Schema Zod | `<x>.schema.ts` / `create<X>Schema` | `create-quest.schema.ts` |
| Tabela/coluna | `@@map` plural / `@map` snake_case | `quests` / `reward_xp` |
| Teste | `<arquivo-alvo>.test.ts` | `create-quest.test.ts` |

> Evitar nomes quase idênticos para arquivos diferentes (ex.: `progression-engine.test.ts`
> vs `progression.engine.test.ts`) — escolha nomes distintos e descritivos.

## Estratégia de testes

- **Vitest** em ambos apps. Unidade cobre **use cases** e **engines** com repos **in-memory**.
- Repos in-memory expõem `seed(...)` como **builder** de dados de teste.
- `publishEvent` é injetado (`vi.fn()`) para asserção de eventos.
- **Cobrir**: caminho feliz, erros de validação/conflito, **ownership** (usuário errado),
  e efeitos de evento.
- Existe um teste de **jornada MVP** ponta-a-ponta (`src/tests/mvp-flow.test.ts`) — manter verde.
- Alvo: adicionar testes de **rota/HTTP** (auth, validação, error handler) e **cobertura** com
  threshold no CI.
- **`main` nunca pode ficar com testes vermelhos.**

## Definition of Ready (DoR)

Um card está pronto para começar quando:
- [ ] Objetivo e critérios de aceite claros e testáveis.
- [ ] Regra(s) de negócio relacionada(s) **existem em `business_rules.md`** (ou o card inclui
      documentá-las).
- [ ] Sem **conflito** aberto entre código/doc/regras (senão, decisão registrada e aprovada).
- [ ] Eventos, arquivos afetados e dependências identificados.
- [ ] Está no backlog (`docs/BACKLOG.md`).

## Definition of Done (DoD)

- [ ] Código segue este guardrail e a arquitetura existente (sem novo acoplamento indevido).
- [ ] Entrada validada; ownership e autorização aplicadas.
- [ ] Testes unitários (feliz + erro + ownership + eventos) **verdes**; `main` verde.
- [ ] `lint` + `type-check` passam nos pacotes afetados.
- [ ] Migrations criadas/aplicadas quando houver mudança de schema (com `onDelete`/índices).
- [ ] Eventos novos com fábrica + publisher + consumer/justificativa + teste.
- [ ] Documentação atualizada (`business_rules.md`, ADR se arquitetural, README/`.env.example`).
- [ ] Sem segredo commitado; sem código morto introduzido.

## ADRs existentes

- **ADR-001** — Monólito Modular (Prisma, Fastify, arquitetura de eventos, React+Expo+Tamagui).
- **ADR-002** — Adoção de React Native + Expo Router (mobile-first, RN Web para DX).
- Novas decisões arquiteturais → **novo ADR** (`ADRs/ADR-00X.md`) aprovado antes de implementar.

## Tecnologias aprovadas

- **Backend:** Fastify 5, Prisma 6, PostgreSQL 16, Zod, `@fastify/{jwt,cookie,cors,helmet,multipart,env}`,
  bcryptjs, node-cron, pino, `@aws-sdk/client-s3` (Cloudflare R2), Vitest, tsx.
- **Frontend:** Expo 57, React Native 0.86 + RN Web, Expo Router, Tamagui, React Query,
  React Hook Form, Zod, axios, i18next/react-i18next, expo-secure-store, expo-notifications,
  expo-image-*, Vitest.
- **Infra:** Turborepo, npm workspaces, Docker (Postgres), GitHub Actions (CI a introduzir).

## Tecnologias proibidas no MVP

- **Outro ORM** além de Prisma (ex.: Drizzle) — vetado por ADR-001.
- **Microserviços / filas externas** (Kafka/RabbitMQ/SQS) — manter event bus in-memory no MVP.
- **Redis/cache distribuído** — `InMemoryCache` só se realmente necessário.
- **Zustand/Redux/MobX** — estado de servidor é do React Query; sessão via Context.
- **CSS-in-JS alternativo/NativeWind** — UI é Tamagui.
- **Conceitos fora do MVP** (`domains.md`): Guild, Marketplace, Economia, Equipamentos,
  Inventário, Buff/Debuff, Classes avançadas, Hidden Quest, IA, Ranking Global, Achievements,
  Skills. Não implementar sem decisão de produto + ADR.

## Boas práticas

- Funções puras e pequenas; I/O nas bordas (repos/plugins).
- Injeção de dependência por construtor; nada de singletons ocultos (exceto `eventBus`).
- Constantes de regra no `domain/`, com comentário citando a regra.
- Preferir tipos compartilhados via `@repo/shared-types` (evitar duplicação FE/BE).
- Não deixar código morto (remova o que não é usado no runtime).
- Idempotência em consumers e jobs.

## Fluxo de desenvolvimento

1. Pegar card **Ready** do `docs/BACKLOG.md` (respeitar 🧩 conflitos).
2. Branch a partir de `main`: `feat/<card>-slug` ou `fix/…`/`chore/…`.
3. Implementar seguindo camadas; começar pelo `domain/` + teste.
4. `npm run lint && npm run type-check && npm test` localmente (verde).
5. Atualizar docs/migrations conforme DoD.
6. Abrir PR.

## Fluxo de Pull Request

- PR pequeno e focado em **um** card; título referencia o card.
- **Descrição** com: objetivo, o que mudou, regras/eventos afetados, como testar.
- CI (lint/type-check/test) **verde** obrigatório para merge.
- Revisão checa: arquitetura preservada, segurança (auth/ownership/validação), testes,
  migrations, docs.
- Sem conflito aberto entre código/doc/regras. Merge só com aprovação.

---

## Checklist — novo módulo (domínio backend)

- [ ] Pasta `domains/<x>/{api,application,domain,infrastructure,tests}`.
- [ ] Interface de repositório no `domain/` + impl `prisma-*` **e** `in-memory-*`.
- [ ] Use cases com DI e `execute` tipado; regras no `domain/`.
- [ ] `events.ts` se o domínio emite eventos.
- [ ] Rotas registradas em `app.ts` com prefixo `/api/v1/<x>` e `authenticate`.
- [ ] Testes (feliz/erro/ownership/eventos). Bounded context coerente com `domains.md`.

## Checklist — nova API/rota

- [ ] `preHandler:[app.authenticate]` (ou exceção justificada).
- [ ] Schema de validação para body/params/query.
- [ ] Ownership via `req.user.sub`; sem mass assignment de campos sensíveis.
- [ ] Status codes corretos; erros via `AppError`.
- [ ] Sem regra de negócio na rota (delega ao use case).
- [ ] Teste de rota (200/4xx/401).

## Checklist — novo evento

- [ ] Fábrica `create<Nome>Event` tipada em `domain/events.ts`.
- [ ] Publisher usa `publishEvent` injetável.
- [ ] Consumer em `infrastructure/events/*-plugin.ts` **ou** justificativa “apenas store”.
- [ ] Idempotente; publicado após commit em fluxo transacional.
- [ ] Teste assertando publicação (payload/tipo).

## Checklist — migration

- [ ] Gerada via Prisma (`db:migrate`), versionada, nome descritivo.
- [ ] Relações com `onDelete`; índices em colunas de filtro/join.
- [ ] `@map`/`@@map` (snake_case/plural); timestamps padrão.
- [ ] Sem duplicar fonte de verdade; dados de seed só para dev.
- [ ] Revisada quanto a impacto/rollback.

## Checklist — testes

- [ ] Unidade com repos in-memory + `seed`.
- [ ] Caminho feliz, validação/conflito, ownership, eventos.
- [ ] `publishEvent` mockado quando houver evento.
- [ ] `main` verde; sem `.only`/testes pulados.

## Checklist — documentação

- [ ] `business_rules.md` atualizado (marcar implementado / registrar nova regra).
- [ ] ADR novo se houve decisão arquitetural.
- [ ] `README`/`.env.example` atualizados se mudou setup/config.
- [ ] `docs/BACKLOG.md` atualizado (card movido/fechado).
