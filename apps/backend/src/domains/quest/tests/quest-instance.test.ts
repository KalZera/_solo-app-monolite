import { describe, it, expect } from 'vitest'
import {
  calculateProgress,
  canComplete,
  isExpired,
  isTerminalStatus,
  objectivesCompletionRatio,
  type QuestInstance,
  type QuestInstanceObjective,
  type QuestInstanceStatus,
} from '../domain/quest-instance'

function objective (completed: boolean, id = 'o'): QuestInstanceObjective {
  return { id, description: 'obj', target: 1, current: completed ? 1 : 0, completed }
}

function buildInstance (overrides: Partial<QuestInstance> = {}): QuestInstance {
  return {
    id: 'instance-1',
    questId: 'quest-1',
    scheduledDate: new Date('2026-08-03T03:00:00.000Z'),
    deadline: new Date('2026-08-04T02:59:59.999Z'),
    startedAt: null,
    completedAt: null,
    progress: 0,
    status: 'PENDING',
    rewardGranted: false,
    objectives: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('QuestInstance domain', () => {
  it('treats an instance with no objectives as fully unblocked (ratio 1)', () => {
    expect(objectivesCompletionRatio([])).toBe(1)
    expect(calculateProgress([])).toBe(0)
  })

  it('derives ratio and progress from completed objectives', () => {
    const objectives = [objective(true, 'a'), objective(true, 'b'), objective(false, 'c'), objective(false, 'd')]
    expect(objectivesCompletionRatio(objectives)).toBe(0.5)
    expect(calculateProgress(objectives)).toBe(50)

    const threeOfFour = [objective(true, 'a'), objective(true, 'b'), objective(true, 'c'), objective(false, 'd')]
    expect(calculateProgress(threeOfFour)).toBe(75)
  })

  it('flags terminal statuses correctly', () => {
    const terminal: QuestInstanceStatus[] = ['COMPLETED', 'FAILED', 'EXPIRED']
    const active: QuestInstanceStatus[] = ['PENDING', 'STARTED']
    terminal.forEach((status) => expect(isTerminalStatus(status)).toBe(true))
    active.forEach((status) => expect(isTerminalStatus(status)).toBe(false))
  })

  it('can complete a no-objective instance, but not one below the 70% gate', () => {
    expect(canComplete(buildInstance({ objectives: [] }))).toBe(true)

    const half = [objective(true, 'a'), objective(false, 'b')]
    expect(canComplete(buildInstance({ objectives: half }))).toBe(false)

    const threeOfFour = [objective(true, 'a'), objective(true, 'b'), objective(true, 'c'), objective(false, 'd')]
    expect(canComplete(buildInstance({ objectives: threeOfFour }))).toBe(true)
  })

  it('never allows completing an already-terminal instance (COMPLETED immutable, FAILED final)', () => {
    expect(canComplete(buildInstance({ status: 'COMPLETED' }))).toBe(false)
    expect(canComplete(buildInstance({ status: 'FAILED' }))).toBe(false)
    expect(canComplete(buildInstance({ status: 'EXPIRED' }))).toBe(false)
  })

  it('detects expiration from the deadline', () => {
    const past = new Date('2026-08-01T00:00:00.000Z')
    const now = new Date('2026-08-05T00:00:00.000Z')

    expect(isExpired(buildInstance({ deadline: past, status: 'PENDING' }), now)).toBe(true)
    expect(isExpired(buildInstance({ deadline: null, status: 'PENDING' }), now)).toBe(false)
    expect(isExpired(buildInstance({ deadline: past, status: 'COMPLETED' }), now)).toBe(false)
    expect(isExpired(buildInstance({ status: 'EXPIRED' }), now)).toBe(true)
  })
})
