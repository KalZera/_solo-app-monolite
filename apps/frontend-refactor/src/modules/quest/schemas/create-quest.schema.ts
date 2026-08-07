import { z } from 'zod'
import type { TFunction } from 'i18next'
import { QUEST_RANKS } from '../domain/quest-rank'
import { SCHEDULABLE_RECURRENCES } from '../domain/recurrence'

// Mirrors the backend's createQuestBodySchema (title ≤120, description ≤1000,
// objective description ≤200, positive integer targets). `rewardXp` is never
// sent — the server derives it from the rank.
export function createQuestSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t('quest.validation.titleMin'))
      .max(120, t('quest.validation.titleMax')),
    description: z
      .string()
      .trim()
      .min(1, t('quest.validation.descriptionMin'))
      .max(1000, t('quest.validation.descriptionMax')),
    rank: z.enum(QUEST_RANKS, { message: t('quest.validation.rankRequired') }),
    recurrence: z.enum(SCHEDULABLE_RECURRENCES, {
      message: t('quest.validation.recurrenceRequired'),
    }),
    categoryId: z.string().nullable().default(null),
    objectives: z
      .array(
        z.object({
          description: z
            .string()
            .trim()
            .min(1, t('quest.validation.objectiveDescriptionMin'))
            .max(200, t('quest.validation.objectiveDescriptionMax')),
          target: z.coerce
            .number({ message: t('quest.validation.targetInteger') })
            .int(t('quest.validation.targetInteger'))
            .positive(t('quest.validation.targetPositive')),
        }),
      )
      .default([]),
  })
}

export type CreateQuestFormValues = z.infer<ReturnType<typeof createQuestSchema>>
export type CreateQuestFormInput = z.input<ReturnType<typeof createQuestSchema>>
