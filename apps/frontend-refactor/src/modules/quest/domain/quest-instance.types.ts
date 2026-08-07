// A QuestInstance is one execution of a Quest template for a given period.
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
  deadline: string | null
  startedAt: string | null
  completedAt: string | null
  progress: number
  status: QuestInstanceStatus
  rewardGranted: boolean
  objectives: QuestInstanceObjective[]
  createdAt: string
  updatedAt: string
}
