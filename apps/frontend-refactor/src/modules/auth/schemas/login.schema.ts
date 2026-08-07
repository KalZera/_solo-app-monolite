import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z
      .string()
      .min(1, t('auth.validation.emailRequired'))
      .email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>
