// A QuestInstance is one execution of a Quest template for a given period.

import type { Quest } from "./quest.types"

// Start / complete / progress all act on instances, never on templates.
export type QuestInstanceStatus = 'PENDING' | 'STARTED' | 'COMPLETED' | 'FAILED' | 'EXPIRED'

export interface QuestInstanceObjective {
  id: string
  description: string
  target: number
  current: number
  completed: boolean
}

export interface QuestInstance {
  id: string
  questId: string
  scheduledDate: string
  deadline: string
  startedAt: string | null
  completedAt: string | null
  progress: number
  status: QuestInstanceStatus
  rewardGranted: boolean
  objectives?: QuestInstanceObjective[]
  createdAt: string
  updatedAt: string
}

export interface QuestFullInstance {
  id: string
  questId: string
  scheduledDate: string
  deadline: string
  startedAt: string | null
  completedAt: string | null
  progress: number
  status: QuestInstanceStatus
  rewardGranted: boolean
  objectives?: QuestInstanceObjective[]
  createdAt: string
  updatedAt: string
  quest: Quest
}
