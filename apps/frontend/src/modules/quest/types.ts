export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'failed' | 'expired'
export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event'
export type CreatableQuestType = Extract<QuestType, 'daily' | 'main'>

export interface QuestObjective {
  id: string
  description: string
  target: number
  current: number
  completed: boolean
}

export interface Quest {
  id: string
  characterId: string
  title: string
  description: string
  questRank: string
  type: QuestType
  status: QuestStatus
  objectives: QuestObjective[]
  rewardXp: number
  rewardGold: number
  minLevel: number
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateQuestInput {
  title: string
  description: string
  questRank: string
  type?: CreatableQuestType
  rewardXp: number
}
