import { httpClient } from '@/shared/api/http-client'
import type { CharacterStats } from '@/modules/profile/domain/character.types'
import type { CreateQuestPayload, Paginated, Quest, QuestCategory } from '../domain/quest.types'
import type { QuestFullInstance, QuestInstance } from '../domain/quest-instance.types'
import type { Recurrence } from '../domain/recurrence'

// ─── Templates ───────────────────────────────────────────────────────────────
// GET /quests is paginated: page/pageSize in, { data, total, page, pageSize } out.
export function listQuests(params: { page: number; pageSize: number }): Promise<Paginated<Quest>> {
  return httpClient.get<Paginated<Quest>>('/quests/', {
    query: { page: params.page, pageSize: params.pageSize },
  })
}

export function createQuest(payload: CreateQuestPayload): Promise<Quest> {
  return httpClient.post<Quest>('/quests/', payload)
}

// Editable template fields (mirrors updateQuestBodySchema on the backend).
export interface UpdateQuestPayload {
  title?: string
  description?: string
  rank?: string
  recurrence?: Recurrence
  categoryId?: string | null
  deadlineDate?: string
}

export function updateQuest(id: string, payload: UpdateQuestPayload): Promise<Quest> {
  return httpClient.patch<Quest>(`/quests/${id}`, payload)
}

// Stops (CANCELLED) or resumes (ACTIVE) a quest's recurrence. COMPLETED is set only server-side
// by the deadline job, so it is not a valid client value here.
export function updateQuestRecurrence(id: string, active: 'ACTIVE' | 'CANCELLED'): Promise<Quest> {
  return httpClient.patch<Quest>(`/quests/${id}/recurrence`, { active })
}

export function listQuestCategories(): Promise<QuestCategory[]> {
  return httpClient.get<QuestCategory[]>('/quest-categories/')
}

// ─── Instances (executions) ──────────────────────────────────────────────────
// GET /today lazily materialises the current-period instance of every active
// template and returns them (idempotent).
export function getTodayQuests(): Promise<QuestInstance[]> {
  return httpClient.get<QuestInstance[]>('/quests/today')
}

export function getQuestById(id: string): Promise<QuestFullInstance> {
  return httpClient.get<QuestFullInstance>(`/quests/${id}`)
}

// Currently-actionable executions only (backend-filtered): today's plus recurring
// ones still open/in-progress; completed and expired are excluded. Not used by the
// Quest List UI (which uses listQuests) — kept for future use.
export function getActiveQuests(): Promise<QuestInstance[]> {
  return httpClient.get<QuestInstance[]>('/quests/today', { query: { status: 'active' } })
}

export type QuestTab = 'all' | 'daily' | 'weekly' | 'history'

export function startQuestInstance(instanceId: string): Promise<{ instance: QuestInstance }> {
  return httpClient.post<{ instance: QuestInstance }>(`/quests/instances/${instanceId}/start`)
}

export interface CompleteQuestResult {
  instance: QuestInstance
  character: { level: number; stats: CharacterStats }
  levelsGained: number[]
}

export function completeQuestInstance(instanceId: string): Promise<CompleteQuestResult> {
  return httpClient.post<CompleteQuestResult>(`/quests/instances/${instanceId}/complete`)
}

export interface UpdateQuestObjectiveInput {
  instanceId: string
  objectiveId: string
  // Omitted → the objective is marked fully done (current = target).
  current?: number
}

export function updateQuestObjective(
  input: UpdateQuestObjectiveInput,
): Promise<{ instance: QuestInstance }> {
  return httpClient.post<{ instance: QuestInstance }>(
    `/quests/instances/${input.instanceId}/progress`,
    { objectiveId: input.objectiveId, current: input.current },
  )
}
