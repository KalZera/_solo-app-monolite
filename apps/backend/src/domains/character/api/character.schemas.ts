import { z } from 'zod'
import { CHARACTER_CLASSES } from '../domain/character'

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

// Partial: only the attributes being spent on need to be present (e.g. { strength: 2, luck: 1 }).
// z.record with an enum key rejects unknown attributes while still allowing any subset of them.
export const allocateAttributesBodySchema = z.object({
  allocations: z.record(z.enum(ALLOCATABLE_ATTRIBUTES), z.coerce.number().int().nonnegative()),
})

export const characterHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
})
