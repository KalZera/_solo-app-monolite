# Backlog — Solo Leveling (MVP)

Gerado a partir da auditoria (`docs/AUDIT_REPORT.md`). Organizado por sprint, sem cards
duplicados. Estimativas em pontos (1 = ~½ dia, 2 = ~1 dia, 3 = ~2 dias, 5 = ~3-4 dias).

> **Regra de processo:** cards que dependem de um [Conflito que Exige Decisão]
> (report, Fase 12) estão marcados com 🧩.
>
> ✅ **Os 9 conflitos foram resolvidos em 2026-08-01** (ver `docs/business_rules.md` ›
> "Decisões de Auditoria" e `ADRs/ADR-003.md`). Os cards abaixo já refletem as decisões e
> estão **liberados para implementação** após aprovação da ordem de execução.

**Legenda de prioridade:** 🔴 Crítica · 🟠 Alta · 🟡 Média · 🟢 Baixa

---

## Sprint 0 — Correções Críticas & Higiene (destravar `main`)

> ✅ **Sprint 0 implementada em 2026-08-01.** Lint + type-check limpos; suíte **169/169 verde**.
> CARD-005: schema + migration de cascade prontos e schema validado; **aplicar a migration
> (`prisma migrate deploy`) contra um banco** — não executada aqui por ausência de DB no ambiente.

### CARD-001 · Autenticar e escopar a troca de senha 🔴
- **Objetivo:** Impedir account takeover pelo endpoint de senha.
- **Descrição:** `PATCH /identity/password` está sem `authenticate` e troca a senha por
  `{email,newPassword}`. Exigir autenticação, escopar ao usuário do token e validar senha atual.
- **Critérios de aceite:**
  - Rota exige `preHandler:[app.authenticate]`.
  - Só altera a senha do `req.user.sub`; ignora `email` do body.
  - Exige `currentPassword` válido; senha nova com política mínima.
  - Teste de rota cobrindo 401 (sem token) e 403 (senha atual errada).
- **Business Rules:** autenticação por JWT.
- **Eventos:** — (opcional `PasswordChanged`).
- **Arquivos:** `identity/api/routes.ts`, `identity/application/update-user.ts`, novo teste.
- **Dependências:** —  · **Estimativa:** 2 · **Prioridade:** 🔴

### CARD-002 · Registrar o error handler global 🔴
- **Objetivo:** Aplicar contrato de erro e evitar vazamento em 500.
- **Descrição:** `errorHandler` existe mas nunca é plugado. Registrar em `buildApp` e mapear
  erros do Prisma (ex.: `P2003` FK, `P2025` not found) para respostas seguras.
- **Critérios de aceite:**
  - `app.setErrorHandler(errorHandler)` ativo.
  - `AppError` → `{error,message}` com `statusCode` correto; 500 sem stack/mensagem interna.
  - Erros Prisma conhecidos mapeados para 4xx.
- **Business Rules:** — · **Eventos:** —
- **Arquivos:** `app.ts`, `infrastructure/http/error-handler.ts`.
- **Dependências:** —  · **Estimativa:** 2 · **Prioridade:** 🔴

### CARD-003 · Corrigir suíte vermelha (limite de diárias) 🟠
- **Objetivo:** `main` com testes verdes.
- **Descrição:** ✅ Decisão #5 = **3**. Manter `MAX_ACTIVE_DAILY_QUESTS=3` e alinhar os 2
  testes (que assumem 5) e `business_rules.md` (já documentado).
- **Critérios de aceite:**
  - Valor único definido e documentado em `business_rules.md`.
  - `create-quest.test.ts` e `mvp-flow.test.ts` refletindo o valor.
  - `npm test` verde no backend.
- **Business Rules:** limite de quests diárias ativas (a documentar).
- **Eventos:** — · **Arquivos:** `quest/domain/quest.ts`, 2 testes, `docs/business_rules.md`.
- **Dependências:** Conflito #5 · **Estimativa:** 1 · **Prioridade:** 🟠

### CARD-004 · Pipeline de CI (lint + type-check + test) 🟠
- **Objetivo:** Impedir regressões e suíte vermelha em `main`.
- **Descrição:** Criar `.github/workflows/ci.yml` rodando `turbo lint type-check test` em PRs
  e push, com Node 20 e cache.
- **Critérios de aceite:**
  - Workflow roda nos 3 pacotes; falha bloqueia merge.
  - Job de `db:migrate` opcional com Postgres de serviço.
- **Business Rules:** — · **Eventos:** —
- **Arquivos:** `.github/workflows/ci.yml`.
- **Dependências:** CARD-003 (para o CI nascer verde) · **Estimativa:** 2 · **Prioridade:** 🟠

### CARD-005 · Cascade/soft-delete e delete de personagem seguro 🟠
- **Objetivo:** `DELETE /characters` funcionar sem erro de FK.
- **Descrição:** Schema sem `onDelete`. Definir `onDelete: Cascade` (ou soft delete) para
  filhos de `Character` (progression, restPoints, quests, objectives, history, rewards) e/ou
  deletar em `prisma.$transaction`.
- **Critérios de aceite:**
  - Migration aplicando a estratégia escolhida.
  - Deletar personagem com filhos não lança FK; teste cobre o cenário.
- **Business Rules:** — · **Eventos:** —
- **Arquivos:** `prisma/schema.prisma`, nova migration, `character/.../delete-character.ts`,
  `prisma-character-repository.ts`.
- **Dependências:** —  · **Estimativa:** 3 · **Prioridade:** 🟠

---

## Sprint 1 — Integridade de Dados & Anti-cheat

> ✅ **Sprint 1 implementada em 2026-08-02** (backend 27 arquivos / 178 testes verdes;
> lint + type-check limpos). CARD-101/102/103/105 concluídos. CARD-104 entregue para o caso
> de maior valor (level-up atômico); a parte cross-repo foi separada em **CARD-104b**.

### CARD-101 · Fechar mass assignment no update de personagem 🔴
- **Objetivo:** Impedir set arbitrário de atributos/level/powerScore e travar campos imutáveis.
- **Descrição:** Remover `stats`/`level`/`experience`/`powerScore` **e `name`** do
  `UpdateCharacterUseCase` (✅ #4: nome imutável). Atributos só mudam por
  `allocate-attribute-point`. **`title` permanece editável** (✅ #3).
- **Critérios de aceite:**
  - `PATCH /characters` não altera stats/level/powerScore/name.
  - `title` continua editável; teste cobre ambos.
  - Tentativa de enviar `stats`/`name` é ignorada/rejeitada.
- **Business Rules:** nome imutável (#4); título editável (#3); sem downgrade de atributo.
- **Eventos:** — · **Arquivos:** `update-character.ts`, `character/api/routes.ts`, teste.
- **Dependências:** Conflitos #3/#4 · **Estimativa:** 2 · **Prioridade:** 🔴

### CARD-102 · Validação de input (Zod) em todas as rotas 🟠
- **Objetivo:** Estabelecer o boundary de validação no backend.
- **Descrição:** Criar schemas Zod (ou JSON Schema Fastify) para body/params/query de cada
  rota; parsear antes do use case. Padronizar erro 400 via `ValidationError`.
- **Critérios de aceite:**
  - Toda rota valida entrada; tipos derivados do schema (fim de `req.body as ...`).
  - Testes de rota para payloads inválidos.
- **Business Rules:** — · **Eventos:** —
- **Arquivos:** todas `*/api/routes.ts`, novos `*/api/*.schema.ts`.
- **Dependências:** CARD-002 · **Estimativa:** 5 · **Prioridade:** 🟠

### CARD-103 · Reward de quest derivado do rank (tabela E..S) 🟠
- **Objetivo:** Eliminar inflação de XP por `rewardXp` livre.
- **Descrição:** Implementar tabela rank→XP e derivar `rewardXp` do `questRank`; remover XP do
  input do usuário (ou limitar). Cobrir também `update-quest`.
- **Critérios de aceite:**
  - `rewardXp` calculado do rank; input livre não aceito.
  - Ranks válidos validados; teste de curva por rank.
- **Business Rules:** classificação por ranks — ✅ #9: **E-10, D-20, C-50, B-100, A-250, S-500**.
- **Eventos:** `XPGranted`. · **Arquivos:** `quest/domain/quest.ts`, `create-quest.ts`,
  `update-quest.ts`, testes.
- **Dependências:** Conflito #9 · **Estimativa:** 3 · **Prioridade:** 🟠

### CARD-104 · Level-up atômico (grant-experience) 🟠 ✅ concluído
- **Objetivo:** Um level-up nunca salva nível/XP sem creditar os rest points (e vice-versa).
- **Descrição:** `ProgressionRepository.saveWithRestPoints` grava a progressão e credita os
  rest points **na mesma `prisma.$transaction`**; `GrantExperienceUseCase` passou a usá-lo.
  Eventos publicados após a persistência.
- **Critérios de aceite:**
  - ✅ Update de progressão + rest points atômicos (Prisma `$transaction`).
  - ✅ Comportamento preservado (in-memory) e suíte verde.
- **Arquivos:** `progression/repositories/progression-repository.ts`,
  `prisma-progression-repository.ts`, `in-memory-progression-repository.ts`, `grant-experience.ts`.
- **Estimativa:** 3 · **Prioridade:** 🟠

### CARD-104b · Unit of Work para transações cross-repo 🟡
- **Objetivo:** Atomicidade em operações que cruzam agregados/repos diferentes.
- **Descrição:** Introduzir um Unit of Work (repos ligados a um `tx` do Prisma) para envolver:
  `allocate-attribute-point` (character.save + restPoint.save) e `complete-quest`
  (quest.save + grant-experience + renew) em uma única transação. Requer **banco** para
  verificação end-to-end (não disponível no ambiente atual).
- **Critérios de aceite:**
  - Interface de UoW com impl Prisma (tx) e in-memory (no-op/shared store).
  - Falha no meio faz rollback total; teste de integração com DB.
- **Arquivos:** novo `shared/database/unit-of-work.ts`, repos Prisma/in-memory,
  `allocate-attribute-point.ts`, `complete-quest.ts`, wiring de rotas.
- **Dependências:** ambiente com Postgres · **Estimativa:** 5 · **Prioridade:** 🟡

### CARD-105 · Remover mass assignment de `status` em update-quest 🟡
- **Objetivo:** Impedir flip arbitrário de status (reabrir/forçar completed).
- **Descrição:** Tirar `status` do `UpdateQuestUseCase`; transições só via casos dedicados
  (complete/expire).
- **Critérios de aceite:** `PATCH /quests/:id` não altera `status`; teste cobre.
- **Business Rules:** quest não atualizável após concluída.
- **Eventos:** — · **Arquivos:** `update-quest.ts`, teste.
- **Dependências:** CARD-102 · **Estimativa:** 1 · **Prioridade:** 🟡

---

## Sprint 2 — Consistência Doc↔Código & Arquitetura

### CARD-201 · Unificar curva de XP / engine de progressão 🟡
- **Objetivo:** Uma única fonte de verdade para nível/XP.
- **Descrição:** ✅ Decisão #6 (**ADR-003**): adotar **`ProgressionEngine` +
  `ContinuousCurveStrategy`** como engine única e **remover** `applyExperienceGain` e
  `level.engine.ts`. Reescrever `GrantExperienceUseCase` sobre XP total via `ProgressionEngine`.
- **Critérios de aceite:**
  - `applyExperienceGain`/`level.engine.ts` removidos; nada no runtime os referencia.
  - `GrantExperienceUseCase` usa `ProgressionEngine`; testes ajustados (números de leveling).
  - Frontend usa a mesma curva (ver CARD-202).
- **Business Rules:** curva de níveis (dúvida aberta em domains.md).
- **Eventos:** — · **Arquivos:** `progression/engines/*`, testes.
- **Dependências:** Conflito #6 · **Estimativa:** 3 · **Prioridade:** 🟡

### CARD-202 · Eliminar engine duplicada no frontend 🟡
- **Objetivo:** Evitar divergência de cálculo cliente/servidor.
- **Descrição:** Consumir progressão do backend (perfil já retorna nível/XP/restPoints) e/ou
  compartilhar a engine via `@repo/shared-types`/pacote comum.
- **Critérios de aceite:** FE não recalcula nível de forma divergente; testes atualizados.
- **Business Rules:** — · **Eventos:** —
- **Arquivos:** `frontend/src/modules/progression/*`.
- **Dependências:** CARD-201, CARD-203 · **Estimativa:** 3 · **Prioridade:** 🟡

### CARD-203 · Ativar `@repo/shared-types` (contrato FE↔BE) 🟡
- **Objetivo:** Realizar o benefício do monorepo.
- **Descrição:** Mover tipos comuns (`ID`, `Paginated`, DTOs de resposta) para
  `packages/shared-types` e importar em ambos apps.
- **Critérios de aceite:** backend e frontend importam de `@repo/shared-types`; sem
  redefinições duplicadas.
- **Business Rules:** — · **Eventos:** —
- **Arquivos:** `packages/shared-types/src/*`, tsconfig paths, imports.
- **Dependências:** —  · **Estimativa:** 3 · **Prioridade:** 🟡

### CARD-204 · Documentar integração quest→progression (síncrona) 🟢 ✅ decidido
- **Objetivo:** Registrar a decisão arquitetural.
- **Descrição:** ✅ Decisão #7: manter a chamada **síncrona**; `QuestCompleted` segue para
  histórico/auditoria. **ADR-003 já criado.** Card reduzido a garantir o alinhamento do código
  ao ADR (sem migração para consumer).
- **Critérios de aceite:** ADR-003 referenciado no código/PR; sem migração para consumer.
- **Business Rules:** “quem concede XP é o Progression Engine” (domains.md).
- **Eventos:** `QuestCompleted` → `XPGranted`. · **Arquivos:** `complete-quest.ts`,
  `grant-experience.ts`, novo consumer/plugin, `ADRs/ADR-003.md`.
- **Dependências:** Conflito #7 · **Estimativa:** 5 · **Prioridade:** 🟡

### CARD-205 · Índices de banco 🟡
- **Objetivo:** Performance de listagens.
- **Descrição:** `@@index` em `Quest.characterId`, `Quest.status`, `CharacterHistory.characterId`,
  `Reward.characterId`, `Character.userId`, `Notification.userId`.
- **Critérios de aceite:** migration com índices; sem regressão.
- **Arquivos:** `schema.prisma`, migration. · **Estimativa:** 2 · **Prioridade:** 🟡

### CARD-206 · Sincronizar `business_rules.md` com o implementado 🟡 🧩
- **Objetivo:** Doc confiável.
- **Descrição:** Marcar itens já implementados; corrigir conflitos aprovados; documentar
  regras nascidas no código (limite de diárias, +5 rest points, 70% da main).
- **Critérios de aceite:** doc revisada e aprovada; sem divergência com o código.
- **Dependências:** Conflitos #1-#9 · **Estimativa:** 2 · **Prioridade:** 🟡

---

## Sprint 3 — Funcionalidades MVP Faltantes

### CARD-301 · Timezone GMT-3 nas quests 🟠 🧩
- **Objetivo:** Deadlines/dia calculados em GMT-3 (regra NFR).
- **Descrição:** Centralizar cálculo de “fim do dia”/ranges em GMT-3 (não hora local do
  servidor). Afeta `calculateDefaultDeadline`, `date-filter`, expiração.
- **Critérios de aceite:** deadlines corretos independentemente do TZ do host; testes com TZ fixo.
- **Business Rules:** timezone em GMT-3 (MVP).
- **Arquivos:** `quest/domain/quest.ts`, `shared/utils/date-filter.ts`, scheduler, testes.
- **Dependências:** —  · **Estimativa:** 3 · **Prioridade:** 🟠

### CARD-302 · Domínio Reward (converter recompensa de quest) 🟡
- **Objetivo:** Materializar `Reward` (schema já existe).
- **Descrição:** Ao completar quest, criar `Reward` (XP/gold) e expor rota de listagem/claim.
- **Critérios de aceite:** `Reward` criado em `QuestCompleted`; `GET /rewards`; testes.
- **Business Rules:** “toda recompensa é consequência de um evento”.
- **Eventos:** `QuestCompleted`→`RewardGranted`. · **Arquivos:** novo domínio `reward/*`,
  `app.ts`. · **Estimativa:** 5 · **Prioridade:** 🟡

### CARD-303 · Notificações (in-app + provedor externo) 🟡
- **Objetivo:** Avisos de quests diárias/semanais.
- **Descrição:** Backend `notification/*` (schema já existe) + integração push/WhatsApp;
  FE já tem scaffolding (`expo-notifications`).
- **Critérios de aceite:** notificação in-app persistida; avisos de diária/semanal; teste.
- **Business Rules:** avisar diárias/semanais; notificar a cada 2 dias; WhatsApp externo.
- **Eventos:** `QuestExpired`, `DailyQuestRenewed` → notificação. · **Arquivos:**
  novo domínio `notification/*`, scheduler, FE providers. · **Estimativa:** 5 · **Prioridade:** 🟡

### CARD-304 · Dashboard de métricas 🟡
- **Objetivo:** Visão de progresso (regra funcional).
- **Descrição:** Endpoint agregando quests concluídas, XP, streak, rank; tela no FE.
- **Critérios de aceite:** métricas por período; tela com estados de loading/empty/erro.
- **Business Rules:** ver métricas em dashboard.
- **Arquivos:** novo use case de leitura, rota, `frontend/.../dashboard`. · **Estimativa:** 5 · **Prioridade:** 🟡

### CARD-305 · Regras de atributo: cap +20 e status healthy/poisoned 🟢 🧩
- **Objetivo:** Regras de negócio pendentes.
- **Descrição:** (a) impedir atributo >20 acima do 2º maior no `allocate`; (b) status do
  personagem (healthy/poisoned). Confirmar `luck`/`CHA` (Conflito #1).
- **Critérios de aceite:** allocate rejeita violação do cap; campo/estado de status + testes.
- **Business Rules:** cap de atributo; status do personagem.
- **Arquivos:** `allocate-attribute-point.ts`, `schema.prisma`, `character/*`, testes.
- **Dependências:** Conflitos #1 · **Estimativa:** 3 · **Prioridade:** 🟢

### CARD-306 · Weekly quests + penalidade de consistência 🟢 🧩
- **Objetivo:** Ampliar tipos de quest e penalidades.
- **Descrição:** Habilitar `weekly` em `CREATABLE_QUEST_TYPES`; aplicar penalidade ao expirar
  (regra “penalty se perder a consistência”).
- **Critérios de aceite:** criar weekly; expirar aplica penalidade definida; testes.
- **Business Rules:** avisos semanais; penalidade de consistência.
- **Dependências:** definição de produto da penalidade · **Estimativa:** 5 · **Prioridade:** 🟢

---

## Sprint 4 — Hardening, Observabilidade & DevOps

### CARD-401 · Rate limiting 🟡
- **Objetivo:** Mitigar brute force.
- **Descrição:** `@fastify/rate-limit` global + limites estritos em `/login`,`/register`,`/refresh`.
- **Critérios:** 429 após N tentativas; teste. · **Arquivos:** `app.ts`. · **Est.:** 2 · 🟡

### CARD-402 · CORS allowlist por ambiente 🟡
- **Descrição:** Substituir `origin:true` por lista via env. **Arquivos:** `app.ts`. · **Est.:** 1 · 🟡

### CARD-403 · Validação de ambiente (@fastify/env) 🟡
- **Descrição:** Usar o dep já instalado para validar `JWT_SECRET`, `DATABASE_URL`, R2 no boot.
  **Arquivos:** novo `infrastructure/env/*`, `app.ts`. · **Est.:** 2 · 🟡

### CARD-404 · Dockerfile de produção (backend) + deploy 🟡
- **Descrição:** Multi-stage build; imagem roda `prisma migrate deploy` + `node dist/server.js`.
  Documentar deploy. **Arquivos:** `apps/backend/Dockerfile`, compose de prod. · **Est.:** 3 · 🟡

### CARD-405 · Scheduler singleton / job externo 🟢
- **Descrição:** Garantir que a expiração rode uma vez só ao escalar (flag/lock ou worker
  dedicado). **Arquivos:** scheduler plugin. · **Est.:** 3 · 🟢

### CARD-406 · Observabilidade (request-id, métricas) 🟢
- **Descrição:** Correlation id nos logs; métricas básicas (Prometheus) e health rico.
  **Arquivos:** `app.ts`, logger. · **Est.:** 3 · 🟢

### CARD-407 · Cobertura + testes de rota/HTTP 🟡
- **Descrição:** `vitest --coverage`, threshold; testes de rota (auth, validação, error handler),
  testes dos repos Prisma. **Arquivos:** vitest config, novos testes. · **Est.:** 5 · 🟡

### CARD-408 · Skeletons + Error Boundary no frontend 🟢
- **Descrição:** Skeletons de loading e boundary global de erro. **Arquivos:** `shared/components/*`,
  `app/_layout.tsx`. · **Est.:** 2 · 🟢

### CARD-409 · README + outbox de eventos (opcional) 🟢
- **Descrição:** Criar `README.md` (setup/scripts). Avaliar padrão outbox transacional para o
  event store. **Arquivos:** `README.md`, `infrastructure/events/*`. · **Est.:** 3 · 🟢

---

### Resumo por Sprint

| Sprint | Foco | Prioridade dominante |
|--------|------|----------------------|
| 0 | Correções críticas + destravar `main` | 🔴/🟠 |
| 1 | Integridade & anti-cheat | 🔴/🟠 |
| 2 | Consistência doc↔código & arquitetura | 🟡 |
| 3 | Features MVP faltantes | 🟠/🟡/🟢 |
| 4 | Hardening / DevOps / observabilidade | 🟡/🟢 |
