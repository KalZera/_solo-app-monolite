import type { ID, Paginated, PaginationParams } from '../../../shared/types/index.js'

export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'failed' | 'expired'
export const QUEST_STATUSES: QuestStatus[] = ['available', 'in_progress', 'completed', 'failed', 'expired']
export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event'

// business_rules.md: "the quest for now will be register only if is a daily quest or main quest"
export const CREATABLE_QUEST_TYPES: QuestType[] = ['daily', 'main']

// business_rules.md (Decisão #9): quests are classified by rank and the XP reward is
// derived from the rank on the server — never supplied by the client (prevents XP inflation).
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
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateQuestData extends Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'objectives'> {
  objectives: Array<Omit<QuestObjective, 'id'>>
}

export type QuestFilter = Partial<Omit<Quest, 'objectives'>>

// Views exposed to the quests screen: quests still open to complete, versus
// quests already resolved (completed or past their deadline).
export type QuestView = 'available' | 'completed_or_expired'

// Resolved quests (completed/expired) only surface for this many days after resolution.
export const COMPLETED_OR_EXPIRED_VISIBILITY_WINDOW_DAYS = 7

// A quest is "expired" once its deadline has passed, whether or not it was ever
// explicitly marked with status 'expired' (there is no background job doing that today).
export function isQuestExpired (quest: Quest, now: Date = new Date()): boolean {
  if (quest.status === 'expired') return true
  if (quest.status === 'completed' || quest.status === 'failed') return false
  return quest.expiresAt !== null && quest.expiresAt < now
}

export function isQuestAvailable (quest: Quest, now: Date = new Date()): boolean {
  return quest.status === 'available' && !isQuestExpired(quest, now)
}

// The moment a quest was "resolved": when it was completed, or its deadline for expired/failed ones.
// 'failed' is what the expiration cron sets once a deadline passes, so it resolves like an expired quest.
function getQuestResolutionDate (quest: Quest): Date | null {
  if (quest.status === 'completed') return quest.completedAt
  if (quest.status === 'failed') return quest.expiresAt
  if (isQuestExpired(quest)) return quest.expiresAt
  return null
}

export function isQuestVisibleInCompletedOrExpiredView (
  quest: Quest,
  now: Date = new Date(),
  windowDays: number = COMPLETED_OR_EXPIRED_VISIBILITY_WINDOW_DAYS
): boolean {
  const resolutionDate = getQuestResolutionDate(quest)
  if (!resolutionDate) return false

  const windowMs = windowDays * 24 * 60 * 60 * 1000
  return now.getTime() - resolutionDate.getTime() <= windowMs
}

export interface QuestRepository {
  findById(id: ID): Promise<Quest | null>
  findByCharacterId(characterId: ID): Promise<Quest[]>
  findByData(filter: QuestFilter, pagination: PaginationParams): Promise<Paginated<Quest>>
  // Active (available/in_progress) quests whose deadline has already passed, across all characters.
  findExpiredActiveQuests(now: Date): Promise<Quest[]>
  create(data: CreateQuestData): Promise<Quest>
  save(id: ID, data: Partial<Quest>): Promise<Quest>
  updateObjective(questId: ID, objectiveId: ID, data: Partial<QuestObjective>): Promise<Quest>
  delete(id: ID): Promise<void>
}

// A main quest can only be completed once more than 70% of its objectives are done.
export const MAIN_QUEST_COMPLETION_THRESHOLD = 0.7

// Ratio of completed objectives, from 0 to 1. A quest with no objectives is treated as unblocked (ratio 1).
export function calculateObjectivesCompletionRatio (objectives: QuestObjective[]): number {
  if (objectives.length === 0) return 1
  const completedCount = objectives.filter((objective) => objective.completed).length
  return completedCount / objectives.length
}

// main quests default to a 28-day deadline; daily quests default to the end of the day
// they were created on ("possible to complete quest any time during the current day").
export function calculateDefaultDeadline (type: QuestType, now: Date = new Date()): Date | null {
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
