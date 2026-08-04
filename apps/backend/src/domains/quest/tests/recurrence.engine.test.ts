import { describe, it, expect } from 'vitest'
import { RecurrenceEngine } from '../engines/recurrence.engine'
import type { Quest } from '../domain/quest'
import type { Recurrence } from '../domain/recurrence'

function buildQuest (overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'quest-1',
    characterId: 'character-1',
    categoryId: null,
    title: 'Academia',
    description: 'Treinar',
    recurrence: 'DAILY',
    rank: 'E',
    rewardXp: 10,
    active: true,
    objectiveTemplates: [],
    createdAt: new Date('2026-08-03T10:00:00.000Z'),
    updatedAt: new Date('2026-08-03T10:00:00.000Z'),
    ...overrides,
  }
}

const engine = new RecurrenceEngine()

describe('RecurrenceEngine', () => {
  it('computes the DAILY period (start/end of day) in GMT-3', () => {
    const quest = buildQuest({ recurrence: 'DAILY' })
    const now = new Date('2026-08-03T12:00:00.000Z') // 09:00 GMT-3

    const scheduledDate = engine.scheduledDateFor(quest, now)
    const deadline = engine.deadlineFor(quest, scheduledDate)

    expect(scheduledDate.toISOString()).toBe('2026-08-03T03:00:00.000Z') // 00:00 GMT-3
    expect(deadline?.toISOString()).toBe('2026-08-04T02:59:59.999Z') // 23:59:59.999 GMT-3
    expect(engine.nextOccurrence('DAILY', scheduledDate).toISOString()).toBe('2026-08-04T03:00:00.000Z')
  })

  it('computes the WEEKLY period anchored on Monday (ISO week) in GMT-3', () => {
    const quest = buildQuest({ recurrence: 'WEEKLY' })
    const now = new Date('2026-08-05T12:00:00.000Z') // Wednesday

    const scheduledDate = engine.scheduledDateFor(quest, now)
    const deadline = engine.deadlineFor(quest, scheduledDate)

    expect(scheduledDate.toISOString()).toBe('2026-08-03T03:00:00.000Z') // Monday 00:00 GMT-3
    expect(deadline?.toISOString()).toBe('2026-08-10T02:59:59.999Z')
    expect(engine.nextOccurrence('WEEKLY', scheduledDate).toISOString()).toBe('2026-08-10T03:00:00.000Z')
  })

  it('computes the MONTHLY period (1st..end of month) in GMT-3', () => {
    const quest = buildQuest({ recurrence: 'MONTHLY' })
    const now = new Date('2026-08-03T12:00:00.000Z')

    const scheduledDate = engine.scheduledDateFor(quest, now)
    const deadline = engine.deadlineFor(quest, scheduledDate)

    expect(scheduledDate.toISOString()).toBe('2026-08-01T03:00:00.000Z')
    expect(deadline?.toISOString()).toBe('2026-09-01T02:59:59.999Z')
    expect(engine.nextOccurrence('MONTHLY', scheduledDate).toISOString()).toBe('2026-09-01T03:00:00.000Z')
  })

  it('anchors a NONE quest to its creation day with no deadline (single instance)', () => {
    const quest = buildQuest({ recurrence: 'NONE', createdAt: new Date('2026-08-03T10:00:00.000Z') })

    // The reference is the creation day, not `now`, so the key never changes across days.
    const first = engine.scheduledDateFor(quest, new Date('2026-08-03T23:00:00.000Z'))
    const later = engine.scheduledDateFor(quest, new Date('2026-08-20T09:00:00.000Z'))

    expect(first.toISOString()).toBe('2026-08-03T03:00:00.000Z')
    expect(later.getTime()).toBe(first.getTime())
    expect(engine.deadlineFor(quest, first)).toBeNull()
  })

  it('returns the same scheduledDate for two moments in the same day (no duplication)', () => {
    const quest = buildQuest({ recurrence: 'DAILY' })

    const morning = engine.scheduledDateFor(quest, new Date('2026-08-03T12:00:00.000Z'))
    const evening = engine.scheduledDateFor(quest, new Date('2026-08-03T23:30:00.000Z')) // 20:30 GMT-3, same day

    expect(morning.getTime()).toBe(evening.getTime())
  })

  it('copies the template objectives into the instance plan', () => {
    const quest = buildQuest({
      objectiveTemplates: [
        { id: 'o1', description: 'Correr', target: 5 },
        { id: 'o2', description: 'Alongar', target: 1 },
      ],
    })

    const plan = engine.planFor(quest, new Date('2026-08-03T12:00:00.000Z'))

    expect(plan.questId).toBe(quest.id)
    expect(plan.objectives).toEqual([
      { description: 'Correr', target: 5 },
      { description: 'Alongar', target: 1 },
    ])
  })

  it('throws for CUSTOM recurrence (not schedulable yet)', () => {
    const quest = buildQuest({ recurrence: 'CUSTOM' as Recurrence })
    expect(() => engine.scheduledDateFor(quest, new Date())).toThrow(/CUSTOM/)
  })
})
