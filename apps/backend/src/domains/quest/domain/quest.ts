import type { ID, Paginated, PaginationParams } from '../../../shared/types/index.js'

export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'failed' | 'expired'
export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event'

// business_rules.md: "the quest for now will be register only if is a daily quest or main quest"
export const CREATABLE_QUEST_TYPES: QuestType[] = ['daily', 'main']

// A character cannot hold more than 3 active daily quests at once.
export const MAX_ACTIVE_DAILY_QUESTS = 3
export const ACTIVE_QUEST_STATUSES: QuestStatus[] = ['available', 'in_progress']

const MAIN_QUEST_DEFAULT_DEADLINE_DAYS = 28

export interface QuestObjective {
  id: ID
  description: string
  target: number
  current: number
  completed: boolean
}

export interface Quest {
  id: ID
  characterId: ID
  categoryId: ID | null
  title: string
  description: string
  questRank: string
  type: QuestType
  status: QuestStatus
  objectives: QuestObjective[]
  rewardXp: number
  rewardGold: number
  minLevel: number
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateQuestData extends Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'objectives'> {
  objectives: Array<Omit<QuestObjective, 'id'>>
}

export type QuestFilter = Partial<Omit<Quest, 'objectives'>>

export interface QuestRepository {
  findById(id: ID): Promise<Quest | null>
  findByCharacterId(characterId: ID): Promise<Quest[]>
  findByData(filter: QuestFilter, pagination: PaginationParams): Promise<Paginated<Quest>>
  create(data: CreateQuestData): Promise<Quest>
  save(id: ID, data: Partial<Quest>): Promise<Quest>
  updateObjective(questId: ID, objectiveId: ID, data: Partial<QuestObjective>): Promise<Quest>
  delete(id: ID): Promise<void>
}

// A main quest can only be completed once more than 70% of its objectives are done.
export const MAIN_QUEST_COMPLETION_THRESHOLD = 0.7

// Ratio of completed objectives, from 0 to 1. A quest with no objectives is treated as unblocked (ratio 1).
export function calculateObjectivesCompletionRatio(objectives: QuestObjective[]): number {
  if (objectives.length === 0) return 1
  const completedCount = objectives.filter((objective) => objective.completed).length
  return completedCount / objectives.length
}

// main quests default to a 28-day deadline; daily quests default to the end of the day
// they were created on ("possible to complete quest any time during the current day").
export function calculateDefaultDeadline(type: QuestType, now: Date = new Date()): Date | null {
  if (type === 'main') {
    const deadline = new Date(now)
    deadline.setDate(deadline.getDate() + MAIN_QUEST_DEFAULT_DEADLINE_DAYS)
    return deadline
  }

  if (type === 'daily') {
    const deadline = new Date(now)
    deadline.setHours(23, 59, 59, 999)
    return deadline
  }

  return null
}
