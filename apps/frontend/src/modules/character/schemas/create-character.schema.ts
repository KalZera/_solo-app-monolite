import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { CharacterClass } from '../types'

export const CLASS_OPTIONS = ['warrior', 'mage', 'rogue', 'ranger', 'healer'] as const satisfies readonly CharacterClass[]

export function createCharacterSchema(t: TFunction) {
  return z.object({
    name: z.string().min(2, t('character.validation.nameMinLength')).max(40, t('character.validation.nameMaxLength')),
    title: z.string().min(2, t('character.validation.titleMinLength')).max(60, t('character.validation.titleMaxLength')),
    class: z.enum(CLASS_OPTIONS, { message: t('character.validation.chooseClass') }),
  })
}

export type CreateCharacterFormValues = z.infer<ReturnType<typeof createCharacterSchema>>
