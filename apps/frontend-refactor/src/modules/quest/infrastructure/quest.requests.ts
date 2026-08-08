import { httpClient } from '@/shared/api/http-client'
import type { CharacterStats } from '@/modules/profile/domain/character.types'
import type { CreateQuestPayload, Quest, QuestCategory } from '../domain/quest.types'
import type { QuestFullInstance, QuestInstance } from '../domain/quest-instance.types'

// ─── Templates ───────────────────────────────────────────────────────────────
export function listQuests(): Promise<Quest[]> {
  return httpClient.get<Quest[]>('/quests/')
}

export function createQuest(payload: CreateQuestPayload): Promise<Quest> {
  return httpClient.post<Quest>('/quests/', payload)
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
// Quest List UI (which uses getQuestsByTab below) — kept for future use.
export function getActiveQuests(): Promise<QuestInstance[]> {
  return httpClient.get<QuestInstance[]>('/quests/today', { query: { status: 'active' } })
}

export type QuestTab = 'all' | 'daily' | 'weekly' | 'history'

// Backend-filtered per Quest List tab (see matchesQuestTab on the server). The
// response is rendered as-is by the UI — no client-side filtering on top.
export function getQuestsByTab(tab: QuestTab): Promise<QuestInstance[]> {
  return httpClient.get<QuestInstance[]>('/quests', { query: { tab } })
}

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
