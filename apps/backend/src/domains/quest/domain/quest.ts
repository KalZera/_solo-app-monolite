import type { ID } from '../../../shared/types/index'
import type { Recurrence } from './recurrence'

// ─── Quest rank → XP (Decisão #9 / CARD-103) ─────────────────────────────────
// The XP reward is derived from the rank on the server, never supplied by the client.
export type QuestRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
export const QUEST_RANKS: QuestRank[] = ['E', 'D', 'C', 'B', 'A', 'S']

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
  active: boolean
  objectiveTemplates: QuestObjectiveTemplate[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateQuestData {
  characterId: ID
  categoryId: ID | null
  title: string
  description: string
  recurrence: Recurrence
  rank: string
  rewardXp: number
  active: boolean
  objectiveTemplates: Array<Omit<QuestObjectiveTemplate, 'id'>>
}

export interface QuestRepository {
  findById(id: ID): Promise<Quest | null>
  findByCharacterId(characterId: ID): Promise<Quest[]>
  // Active templates only — used to materialise today's instances.
  findActiveByCharacterId(characterId: ID): Promise<Quest[]>
  create(data: CreateQuestData): Promise<Quest>
  save(id: ID, data: Partial<Omit<Quest, 'objectiveTemplates'>>): Promise<Quest>
  delete(id: ID): Promise<void>
}
