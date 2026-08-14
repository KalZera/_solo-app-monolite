import { z } from 'zod'

const RECURRENCES = ['NONE', 'DAILY', 'WEEKLY', 'CUSTOM'] as const

const objectiveSchema = z.object({
  description: z.string().min(1).max(200),
  target: z.coerce.number().int().positive(),
})

// `rewardXp` is never accepted — the server derives it from the rank (CARD-103); any client
// value is stripped by Zod's default behaviour.
// `deadlineDate` only applies to NONE-recurrence quests (every quest expires regardless of
// recurrence — business_rules.md); it is ignored for DAILY/WEEKLY/CUSTOM. It is
// normalised server-side to 23:59:59.999 GMT-3 of that calendar day (see NoneStrategy).
export const createQuestBodySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(1000),
  rank: z.string().min(1),
  recurrence: z.enum(RECURRENCES).optional(),
  categoryId: z.string().nullish(),
  deadlineDate: z.coerce.date().optional(),
  objectives: z.array(objectiveSchema).optional(),
})

export const updateQuestBodySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(1000).optional(),
  rank: z.string().min(1).optional(),
  recurrence: z.enum(RECURRENCES).optional(),
  categoryId: z.string().nullish(),
  deadlineDate: z.coerce.date().optional(),
  active: z.boolean().optional(),
})

export const updateProgressBodySchema = z.object({
  objectiveId: z.string().min(1),
  current: z.coerce.number().int().nonnegative().optional(),
})

// `status=active` returns only currently-actionable executions (open, not expired);
// omitted/`all` returns every current-period execution. `tab` scopes the result to a
// single Quest List UI tab (daily/weekly/history) and takes precedence over `status`.
export const todayQuestsQuerySchema = z.object({
  status: z.enum(['all', 'active']).optional(),
  tab: z.enum(['daily', 'weekly', 'history']).optional(),
})

export const listQuestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
})

export const questIdParamsSchema = z.object({ id: z.string().min(1) })

export const questInstanceIdParamsSchema = z.object({ instanceId: z.string().min(1) })
