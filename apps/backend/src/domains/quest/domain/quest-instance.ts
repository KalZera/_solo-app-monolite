import type { ID, Paginated, PaginationParams } from '../../../shared/types/index'
import type { Quest } from './quest'
import type { Recurrence } from './recurrence'

// ─── QuestInstance (EXECUTION) ───────────────────────────────────────────────
// One execution of a Quest template for a given period. Uniquely identified by
// (questId, scheduledDate) — never duplicated.
export type QuestInstanceStatus = 'PENDING' | 'STARTED' | 'COMPLETED' | 'FAILED' | 'EXPIRED'

export const QUEST_INSTANCE_STATUSES: QuestInstanceStatus[] = [
  'PENDING',
  'STARTED',
  'COMPLETED',
  'FAILED',
  'EXPIRED',
]

// Once an instance reaches a terminal status it can no longer transition
// (COMPLETED is immutable; FAILED never returns to PENDING; EXPIRED is final).
export const FINISHED_QUEST_INSTANCE_STATUSES: QuestInstanceStatus[] = ['COMPLETED', 'FAILED', 'EXPIRED']

export interface QuestInstanceObjective {
  id: ID
  description: string
  target: number
  current: number
  completed: boolean
}

export interface QuestInstance {
  id: ID
  questId: ID
  scheduledDate: Date
  deadline: Date
  startedAt: Date | null
  completedAt: Date | null
  progress: number
  status: QuestInstanceStatus
  rewardGranted: boolean
  objectives: QuestInstanceObjective[]
  createdAt: Date
  updatedAt: Date
}

export interface QuestFullInstance {
  id: ID
  questId: ID
  scheduledDate: Date
  deadline: Date
  startedAt: Date | null
  completedAt: Date | null
  progress: number
  status: QuestInstanceStatus
  rewardGranted: boolean
  objectives: QuestInstanceObjective[]
  createdAt: Date
  updatedAt: Date
  quest?: Quest
}

export interface CreateQuestInstanceData {
  questId: ID
  scheduledDate: Date
  deadline: Date
  objectives: Array<Pick<QuestInstanceObjective, 'description' | 'target'>>
}

// An instance WITH objectives can only be completed once more than 70% of them are done
// (preserves the previous "main quest" rule, now per execution). No objectives → completable.
export const OBJECTIVE_COMPLETION_THRESHOLD = 0.7

const PERCENT = 100

export function isTerminalStatus (status: QuestInstanceStatus): boolean {
  return FINISHED_QUEST_INSTANCE_STATUSES.includes(status)
}

// Ratio of completed objectives (0..1). No objectives is treated as unblocked (ratio 1).
export function objectivesCompletionRatio (objectives: QuestInstanceObjective[]): number {
  if (objectives.length === 0) return 1
  const completed = objectives.filter((objective) => objective.completed).length
  return completed / objectives.length
}

// Progress percentage (0..100) derived from objectives. Quests without objectives report 0
// until they are completed (the CompleteQuest use case sets it to 100).
export function calculateProgress (objectives: QuestInstanceObjective[]): number {
  if (objectives.length === 0) return 0
  return Math.round(objectivesCompletionRatio(objectives) * PERCENT)
}

export function canComplete (instance: QuestFullInstance): boolean {
  if (isTerminalStatus(instance.status)) return false
  return objectivesCompletionRatio(instance.objectives || []) > OBJECTIVE_COMPLETION_THRESHOLD
}

export function isExpired (instance: QuestFullInstance, now: Date = new Date()): boolean {
  if (isTerminalStatus(instance.status)) return instance.status === 'EXPIRED'
  return instance.deadline < now
}

// Currently actionable: still open (PENDING/STARTED) and past no deadline. Completed,
// failed and expired executions are excluded (e.g. a weekly already done this week).
export function isActiveInstance (instance: QuestFullInstance, now: Date = new Date()): boolean {
  return !isTerminalStatus(instance.status) && !isExpired(instance, now)
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Grace period (days) a STARTED instance gets past its deadline before the expiration job
// auto-fails it too — being in progress buys extra time, but not indefinitely
// (business_rules.md, 2026-08-06).
export const STARTED_FAIL_GRACE_PERIOD_DAYS = 3

// Decides whether the expiration job (every 2h) should mark this overdue instance FAILED:
//   - still within its deadline, or already terminal → never.
//   - PENDING (never started) → as soon as the deadline passes.
//   - STARTED (in progress) → only once STARTED_FAIL_GRACE_PERIOD_DAYS have elapsed since
//     the deadline (a longer grace period than PENDING, but not indefinite).
export function shouldAutoFail (instance: QuestFullInstance, now: Date = new Date()): boolean {
  if (instance.deadline >= now) return false
  if (instance.status === 'PENDING') return true
  if (instance.status === 'STARTED') {
    const graceMs = STARTED_FAIL_GRACE_PERIOD_DAYS * MS_PER_DAY
    return now.getTime() - instance.deadline.getTime() > graceMs
  }
  return false
}

// Which executions appear in the "active" feed. Open ones always show; additionally a
// DAILY completed today stays visible for the rest of the day (weekly completed
// executions drop out so they don't linger for the whole period).
export function isVisibleInActiveFeed (
  recurrence: Recurrence,
  instance: QuestFullInstance,
  now: Date = new Date()
): boolean {
  if (isActiveInstance(instance, now)) return true
  return recurrence === 'DAILY' && instance.status === 'COMPLETED'
}

// The three Quest List UI tabs. Membership is decided entirely here — the frontend sends
// the selected tab as a query param and renders GetTodayQuestsUseCase's response verbatim,
// with no filtering of its own.
export type QuestTab = 'daily' | 'weekly' | 'history'

export function matchesQuestTab (
  recurrence: Recurrence,
  instance: QuestFullInstance,
  tab: QuestTab,
  now: Date = new Date()
): boolean {
  if (tab === 'daily') return recurrence === 'DAILY'
  if (tab === 'weekly') return recurrence === 'WEEKLY' && isActiveInstance(instance, now)
  return isTerminalStatus(instance.status)
}

export interface QuestInstanceRepository {
  findById(id: ID): Promise<QuestFullInstance | null>
  findByCharacterId(characterId: ID, pagination: PaginationParams): Promise<Paginated<QuestFullInstance>>
  findByQuestActive(active: boolean): Promise<QuestFullInstance[]>
  findByQuestAndScheduledDate(questId: ID, scheduledDate: Date): Promise<QuestFullInstance | null>
  findByQuestId(questId: ID): Promise<QuestFullInstance[]>
  create(data: CreateQuestInstanceData): Promise<QuestFullInstance>
  save(id: ID, data: Partial<Omit<QuestFullInstance, 'objectives'>>): Promise<QuestFullInstance>
  updateObjective(instanceId: ID, objectiveId: ID, data: Partial<QuestInstanceObjective>): Promise<QuestFullInstance>
  // Active (PENDING/STARTED) instances whose deadline has already passed.
  findDueForExpiration(now: Date): Promise<QuestFullInstance[]>
}
