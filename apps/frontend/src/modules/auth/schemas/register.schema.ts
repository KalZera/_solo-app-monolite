import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createRegisterSchema(t: TFunction) {
  return z.object({
    email: z.string().min(1, t('auth.validation.emailRequired')).email(t('auth.validation.emailInvalid')),
    username: z
      .string()
      .min(3, t('auth.validation.usernameMinLength'))
      .max(20, t('auth.validation.usernameMaxLength'))
      .regex(/^[a-zA-Z0-9_]+$/, t('auth.validation.usernamePattern')),
    password: z.string().min(6, t('auth.validation.passwordMinLength')),
  })
}

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>
