import { z } from 'zod'

const QUEST_TYPES = ['daily', 'main', 'side', 'weekly', 'event'] as const
const QUEST_VIEWS = ['available', 'completed_or_expired'] as const

const objectiveSchema = z.object({
  description: z.string().min(1),
  target: z.coerce.number().int().positive(),
})

// Note: `rewardXp` is deliberately NOT part of the schema — the server derives it from the
// quest rank (Decisão #9), so any client-sent value is stripped by Zod and can never inflate XP.
export const createQuestBodySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(1000),
  questRank: z.string().min(1),
  type: z.enum(QUEST_TYPES).optional(),
  categoryId: z.string().nullish(),
  rewardGold: z.coerce.number().int().nonnegative().optional(),
  minLevel: z.coerce.number().int().positive().optional(),
  expiresAt: z.coerce.date().optional(),
  objectives: z.array(objectiveSchema).optional(),
})

export const updateQuestBodySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(1000).optional(),
  questRank: z.string().min(1).optional(),
  type: z.enum(QUEST_TYPES).optional(),
  categoryId: z.string().nullish(),
  rewardGold: z.coerce.number().int().nonnegative().optional(),
  minLevel: z.coerce.number().int().positive().optional(),
  expiresAt: z.coerce.date().nullish(),
})

export const questIdParamsSchema = z.object({ id: z.string().min(1) })

export const questObjectiveParamsSchema = z.object({
  id: z.string().min(1),
  objectiveId: z.string().min(1),
})

export const listQuestsQuerySchema = z.object({
  view: z.enum(QUEST_VIEWS).optional(),
})
