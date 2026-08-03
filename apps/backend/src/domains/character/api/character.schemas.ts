import { z } from 'zod'

const CHARACTER_CLASSES = ['warrior', 'mage', 'rogue', 'ranger', 'healer'] as const
const ALLOCATABLE_ATTRIBUTES = ['strength', 'intelligence', 'agility', 'vitality', 'luck'] as const

export const createCharacterBodySchema = z.object({
  name: z.string().min(1).max(40),
  title: z.string().min(1).max(60),
  class: z.enum(CHARACTER_CLASSES),
  avatar: z.string().nullish(),
})

// Only cosmetic/profile fields. name/stats/level/powerScore are intentionally absent so
// they can never be mass-assigned here (Decisão CARD-101). Unknown keys are stripped.
export const updateCharacterBodySchema = z.object({
  title: z.string().min(1).max(60).optional(),
  class: z.enum(CHARACTER_CLASSES).optional(),
  avatar: z.string().nullish(),
})

export const allocateAttributeBodySchema = z.object({
  attribute: z.enum(ALLOCATABLE_ATTRIBUTES),
  amount: z.coerce.number().int().positive(),
})

export const characterHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
})
