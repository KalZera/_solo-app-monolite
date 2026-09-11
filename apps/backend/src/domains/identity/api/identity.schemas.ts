import { z } from 'zod'

export const registerBodySchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'username may only contain letters, numbers and underscores'),
  password: z.string().min(6),
})

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const updatePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export const updateTutorialBodySchema = z.object({
  isCompleteTutorial: z.boolean(),
})

export const registerDeviceBodySchema = z.object({
  characterId: z.string().uuid(),
  pushToken: z.string().min(1),
  platform: z.enum(['IOS', 'ANDROID']),
})

export const updateDeviceBodySchema = z.object({
  pushToken: z.string().min(1),
  platform: z.enum(['IOS', 'ANDROID']).optional(),
  active: z.boolean().optional(),
})
