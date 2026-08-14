import { z } from 'zod'
import type { TFunction } from 'i18next'
import { CHARACTER_CLASSES } from '../domain/character.types'

// Mirrors the backend's updateCharacterBodySchema for the editable fields. Name is immutable and
// attributes change only through the allocation flow, so neither is part of this form.
export function editCharacterSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, t('character.validation.titleMin'))
      .max(60, t('character.validation.titleMax')),
    class: z.enum(CHARACTER_CLASSES, { message: t('character.validation.classRequired') }),
  })
}

export type EditCharacterFormValues = z.infer<ReturnType<typeof editCharacterSchema>>
