import { httpClient } from '@/shared/api/http-client'
import type { CreateQuestInput, Quest } from '../types'

export async function listQuests(): Promise<Quest[]> {
  const { data } = await httpClient.get<Quest[]>('/quests/')
  return data
}

export async function getQuest(id: string): Promise<Quest> {
  const { data } = await httpClient.get<Quest>(`/quests/${id}`)
  return data
}

export async function createQuest(input: CreateQuestInput): Promise<Quest> {
  const { data } = await httpClient.post<Quest>('/quests/', input)
  return data
}

export async function completeQuest(id: string): Promise<Quest> {
  const { data } = await httpClient.patch<Quest>(`/quests/${id}`, { status: 'completed' })
  return data
}
