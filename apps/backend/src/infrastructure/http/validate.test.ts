import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { parseInput } from './validate'
import { ValidationError } from '../../shared/errors/app-error'
import { createQuestBodySchema } from '../../domains/quest/api/quest.schemas'
import { registerBodySchema } from '../../domains/identity/api/identity.schemas'
import { allocateAttributeBodySchema } from '../../domains/character/api/character.schemas'

describe('parseInput', () => {
  it('returns the parsed data for valid input', () => {
    const schema = z.object({ name: z.string() })
    expect(parseInput(schema, { name: 'hero' })).toEqual({ name: 'hero' })
  })

  it('throws a ValidationError for invalid input', () => {
    const schema = z.object({ name: z.string() })
    expect(() => parseInput(schema, { name: 123 })).toThrow(ValidationError)
  })
})

describe('quest schemas', () => {
  it('strips a client-supplied rewardXp so XP cannot be inflated', () => {
    const result = parseInput(createQuestBodySchema, {
      title: 'Quest',
      description: 'Do something',
      rank: 'A',
      recurrence: 'DAILY',
      rewardXp: 999999,
    })

    expect(result).not.toHaveProperty('rewardXp')
  })

  it('rejects an unknown recurrence', () => {
    expect(() =>
      parseInput(createQuestBodySchema, { title: 'Quest', description: 'x', rank: 'A', recurrence: 'HOURLY' })
    ).toThrow(ValidationError)
  })

  it('rejects a quest without a title', () => {
    expect(() => parseInput(createQuestBodySchema, { title: '', description: 'x', rank: 'A' })).toThrow(ValidationError)
  })
})

describe('identity + character schemas', () => {
  it('rejects an invalid email on register', () => {
    expect(() =>
      parseInput(registerBodySchema, { email: 'not-an-email', username: 'hero', password: 'secret1' })
    ).toThrow(ValidationError)
  })

  it('rejects an unknown attribute on allocate', () => {
    expect(() => parseInput(allocateAttributeBodySchema, { attribute: 'wisdom', amount: 1 })).toThrow(ValidationError)
  })

  it('coerces a numeric attribute amount provided as a string', () => {
    const result = parseInput(allocateAttributeBodySchema, { attribute: 'strength', amount: '3' })
    expect(result.amount).toBe(3)
  })
})
