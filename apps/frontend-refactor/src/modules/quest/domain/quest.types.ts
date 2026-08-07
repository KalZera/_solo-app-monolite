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

export interface Quest {
  id: string
  characterId: string
  categoryId: string | null
  title: string
  description: string
  recurrence: Recurrence
  rank: string
  rewardXp: number
  active: boolean
  // Last day (ISO date) for a NONE-recurrence quest — every quest expires, regardless of
  // recurrence. The actual deadline is always 23:59:59.999 GMT-3 of that day. Null means
  // the server's default (28 days from creation) applies. Ignored for
  // DAILY/WEEKLY/MONTHLY/CUSTOM, which derive their deadline from the period instead.
  deadlineDate: string | null
  objectiveTemplates: QuestObjectiveTemplate[]
  createdAt: string
  updatedAt: string
}

export interface QuestCategory {
  id: string
  name: string
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
