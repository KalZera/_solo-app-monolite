import type { QuestInstance } from './quest-instance.types'
import type { Recurrence } from './recurrence'

/**
 * A Quest is a TEMPLATE (definition), never an execution. Each execution is a
 * QuestInstance on the backend — templates are what this app creates and lists.
 */
export interface QuestObjectiveTemplate {
  id: string
  description: string
  target: number
}

/**
 * Recurrence lifecycle of a quest template. ACTIVE keeps materialising instances; COMPLETED
 * (deadline reached) and CANCELLED (stopped by the Hunter) both stop it. Mirrors the backend enum.
 */
export type QuestActiveStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface Quest {
  id: string
  characterId: string
  categoryId: string | null
  title: string
  description: string
  recurrence: Recurrence
  rank: string
  rewardXp: number
  active: QuestActiveStatus
  // Last day (ISO date) for a NONE-recurrence quest — every quest expires, regardless of
  // recurrence. The actual deadline is always 23:59:59.999 UTC of that day. Always set — the
  // server defaults it to "tomorrow" when the client omits it on creation. Ignored for
  // DAILY/WEEKLY/CUSTOM, which derive their deadline from the period instead.
  deadlineDate: string
  objectiveTemplates?: QuestObjectiveTemplate[]
  createdAt: string
  updatedAt: string
  instance?: QuestInstance
}

export interface QuestCategory {
  id: string
  name: string
}

/** Page envelope returned by paginated list endpoints (e.g. GET /quests). */
export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

/** Body accepted by `POST /quests` (see quest.schemas.ts on the backend). */
export interface CreateQuestPayload {
  title: string
  description: string
  rank: string
  recurrence: Recurrence
  categoryId?: string | null
  // Only meaningful when recurrence is NONE (or omitted); ignored otherwise.
  deadlineDate?: string
  objectives?: { description: string; target: number }[]
}
