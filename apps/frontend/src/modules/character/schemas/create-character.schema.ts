import { z } from 'zod'
import type { CharacterClass } from '../types'

export const CLASS_OPTIONS = ['warrior', 'mage', 'rogue', 'ranger', 'healer'] as const satisfies readonly CharacterClass[]

export const createCharacterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(40, 'Name is too long'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(60, 'Title is too long'),
  class: z.enum(CLASS_OPTIONS, { message: 'Choose a class' }),
})

export type CreateCharacterFormValues = z.infer<typeof createCharacterSchema>
