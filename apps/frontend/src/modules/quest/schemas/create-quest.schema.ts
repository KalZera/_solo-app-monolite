import { z } from 'zod'
import type { CreatableQuestType } from '../types'

export const QUEST_TYPE_OPTIONS = ['daily', 'main'] as const satisfies readonly CreatableQuestType[]

export const QUEST_RANK_OPTIONS = ['E', 'D', 'C', 'B', 'A', 'S'] as const

export type QuestRank = (typeof QUEST_RANK_OPTIONS)[number]

// business_rules.md: Rank E=10xp, D=20xp, C=50xp, B=100xp, A=250xp.
// S isn't documented there; extrapolated at 500xp following the same alternating x2/x2.5 growth (10→20→50→100→250→500).
const RANK_XP_REWARDS: Record<QuestRank, number> = {
  E: 10,
  D: 20,
  C: 50,
  B: 100,
  A: 250,
  S: 500,
}

export function calculateRewardXpForRank(rank: QuestRank): number {
  return RANK_XP_REWARDS[rank]
}

export const createQuestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80, 'Title is too long'),
  description: z.string().min(3, 'Description must be at least 3 characters').max(500, 'Description is too long'),
  questRank: z.enum(QUEST_RANK_OPTIONS, { message: 'Choose a rank' }),
  type: z.enum(QUEST_TYPE_OPTIONS, { message: 'Choose a type' }),
  categoryId: z.string().nullable(),
  rewardXp: z.number().int().positive(),
  objectives: z.array(
    z.object({
      description: z.string().min(3, 'Objective description is too short').max(200, 'Objective description is too long'),
      target: z.coerce
        .number({ message: 'Enter a valid number' })
        .int('Must be a whole number')
        .positive('Must be greater than 0'),
    }),
  ),
})

export type CreateQuestFormValues = z.infer<typeof createQuestSchema>
export type CreateQuestFormInput = z.input<typeof createQuestSchema>
