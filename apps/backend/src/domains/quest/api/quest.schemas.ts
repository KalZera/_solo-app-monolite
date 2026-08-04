import { z } from 'zod'

const RECURRENCES = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'] as const

const objectiveSchema = z.object({
  description: z.string().min(1).max(200),
  target: z.coerce.number().int().positive(),
})

// `rewardXp` is never accepted — the server derives it from the rank (CARD-103); any client
// value is stripped by Zod's default behaviour.
export const createQuestBodySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(1000),
  rank: z.string().min(1),
  recurrence: z.enum(RECURRENCES).optional(),
  categoryId: z.string().nullish(),
  objectives: z.array(objectiveSchema).optional(),
})

export const updateQuestBodySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(1000).optional(),
  rank: z.string().min(1).optional(),
  recurrence: z.enum(RECURRENCES).optional(),
  categoryId: z.string().nullish(),
  active: z.boolean().optional(),
})

export const updateProgressBodySchema = z.object({
  objectiveId: z.string().min(1),
  current: z.coerce.number().int().nonnegative().optional(),
})

export const questIdParamsSchema = z.object({ id: z.string().min(1) })

export const questInstanceIdParamsSchema = z.object({ instanceId: z.string().min(1) })
