import { z } from 'zod'
import type { TFunction } from 'i18next'
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

export function createQuestSchema(t: TFunction) {
  return z.object({
    title: z.string().min(3, t('quest.validation.titleMinLength')).max(80, t('quest.validation.titleMaxLength')),
    description: z
      .string()
      .min(3, t('quest.validation.descriptionMinLength'))
      .max(500, t('quest.validation.descriptionMaxLength')),
    questRank: z.enum(QUEST_RANK_OPTIONS, { message: t('quest.validation.chooseRank') }),
    type: z.enum(QUEST_TYPE_OPTIONS, { message: t('quest.validation.chooseType') }),
    categoryId: z.string().nullable(),
    rewardXp: z.number().int().positive(),
    objectives: z.array(
      z.object({
        description: z
          .string()
          .min(3, t('quest.validation.objectiveDescriptionMinLength'))
          .max(200, t('quest.validation.objectiveDescriptionMaxLength')),
        target: z.coerce
          .number({ message: t('quest.validation.invalidNumber') })
          .int(t('quest.validation.mustBeWholeNumber'))
          .positive(t('quest.validation.mustBeGreaterThanZero')),
      }),
    ),
  })
}

export type CreateQuestFormValues = z.infer<ReturnType<typeof createQuestSchema>>
export type CreateQuestFormInput = z.input<ReturnType<typeof createQuestSchema>>
