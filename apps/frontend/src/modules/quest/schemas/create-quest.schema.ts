import { z } from 'zod'
import type { CreatableQuestType } from '../types'

export const QUEST_TYPE_OPTIONS = ['daily', 'main'] as const satisfies readonly CreatableQuestType[]

export const createQuestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80, 'Title is too long'),
  description: z.string().min(3, 'Description must be at least 3 characters').max(500, 'Description is too long'),
  questRank: z.string().min(1, 'Rank is required').max(10, 'Rank is too long'),
  type: z.enum(QUEST_TYPE_OPTIONS),
  rewardXp: z.coerce
    .number({ message: 'Enter a valid number' })
    .int('Must be a whole number')
    .positive('Must be greater than 0'),
})

export type CreateQuestFormValues = z.infer<typeof createQuestSchema>
export type CreateQuestFormInput = z.input<typeof createQuestSchema>
