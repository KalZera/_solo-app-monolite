import type { ID } from '../../../shared/types/index'

export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'failed' | 'expired'
export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event'

export interface QuestObjective {
  id: ID
  description: string
  target: number
  current: number
  completed: boolean
}

export interface Quest {
  id: ID
  title: string
  description: string
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

export interface QuestRepository {
  findById(id: ID): Promise<Quest | null>
  findAll(filters?: { type?: QuestType; status?: QuestStatus }): Promise<Quest[]>
  create(data: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quest>
  update(id: ID, data: Partial<Quest>): Promise<Quest>
}
