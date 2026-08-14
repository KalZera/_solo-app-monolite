import type { ID } from '../../../shared/types/index'
import type { QuestInstance } from './quest-instance'
import type { Recurrence } from './recurrence'

// ─── Quest rank → XP (Decisão #9 / CARD-103) ─────────────────────────────────
// The XP reward is derived from the rank on the server, never supplied by the client.
export type QuestRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
export const QUEST_RANKS: QuestRank[] = ['E', 'D', 'C', 'B', 'A', 'S']
export const MAX_ACTIVE_DAILY_QUESTS = 5

const QUEST_RANK_XP: Record<QuestRank, number> = {
  E: 10,
  D: 20,
  C: 50,
  B: 100,
  A: 250,
  S: 500,
}

export function isQuestRank (value: string): value is QuestRank {
  return (QUEST_RANKS as string[]).includes(value)
}

export function xpForQuestRank (rank: QuestRank): number {
  return QUEST_RANK_XP[rank]
}

// Recurrence lifecycle of a Quest TEMPLATE. ACTIVE keeps materialising instances (the old
// `active = true`); COMPLETED (deadline reached) and CANCELLED (stopped by the Hunter) both stop it.
export type QuestActiveStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export const QUEST_ACTIVE_STATUSES: QuestActiveStatus[] = ['ACTIVE', 'COMPLETED', 'CANCELLED']

export function isQuestActiveStatus (value: string): value is QuestActiveStatus {
  return (QUEST_ACTIVE_STATUSES as string[]).includes(value)
}

// ─── Quest (TEMPLATE) ────────────────────────────────────────────────────────
// A Quest is a definition only — it never represents an execution. Each execution is a
// QuestInstance (see quest-instance.ts). Editing a Quest never touches past executions.
export interface QuestObjectiveTemplate {
  id: ID
  description: string
  target: number
}

export interface Quest {
  id: ID
  characterId: ID
  categoryId: ID | null
  title: string
  description: string
  recurrence: Recurrence
  rank: string
  rewardXp: number
  active: QuestActiveStatus
  // Last day (any instant within it — normalised to its UTC calendar day) for a
  // NONE-recurrence quest's single instance — every quest expires regardless of recurrence
  // (business_rules.md, ADR-004 addendum). The actual deadline is always 23:59:59.999 UTC
  // of that day. Ignored for DAILY/WEEKLY/CUSTOM, whose deadline is derived from the
  // period instead. Always set — defaults to "tomorrow" at creation when the client omits it.
  deadlineDate: Date
  objectiveTemplates: QuestObjectiveTemplate[]
  createdAt: Date
  updatedAt: Date
}

export interface QuestParsed {
  id: ID
  characterId: ID
  categoryId: ID | null
  title: string
  description: string
  recurrence: Recurrence
  rank: string
  rewardXp: number
  active: QuestActiveStatus
  deadlineDate: Date
  createdAt: Date
  updatedAt: Date
  instance: QuestInstance
}

export interface CreateQuestData {
  characterId: ID
  categoryId: ID | null
  title: string
  description: string
  recurrence: Recurrence
  rank: string
  rewardXp: number
  active: QuestActiveStatus
  deadlineDate: Date
  objectiveTemplates: Array<Omit<QuestObjectiveTemplate, 'id'>>
}

export interface QuestRepository {
  findById(id: ID): Promise<Quest | null>
  findByCharacterId(characterId: ID, recurrence?: Recurrence): Promise<Quest[]>
  // Active templates only — used to materialise today's instances.
  findActiveByCharacterId(characterId: ID): Promise<Quest[]>
  findManyByActive(status: QuestActiveStatus): Promise<Quest[]>
  create(data: CreateQuestData): Promise<Quest>
  save(id: ID, data: Partial<Omit<Quest, 'objectiveTemplates'>>): Promise<Quest>
  delete(id: ID): Promise<void>
}
