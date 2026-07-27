import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores are allowed'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
