import { z } from 'zod'
import type { TFunction } from 'i18next'
import { CHARACTER_CLASSES } from '../domain/character.types'

// Mirrors the backend's createCharacterBodySchema (name ≤40, title ≤60, class enum).
export function createCharacterSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('character.validation.nameMin'))
      .max(40, t('character.validation.nameMax')),
    title: z
      .string()
      .trim()
      .min(1, t('character.validation.titleMin'))
      .max(60, t('character.validation.titleMax')),
    class: z.enum(CHARACTER_CLASSES, { message: t('character.validation.classRequired') }),
  })
}

export type CreateCharacterFormValues = z.infer<ReturnType<typeof createCharacterSchema>>
