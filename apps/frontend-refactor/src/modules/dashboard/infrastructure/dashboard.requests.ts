import { httpClient } from '@/shared/api/http-client'

export interface DashSummary {
  completedQuests: number
  streakDays: number
  pointsToday: number
}

export function getDashboardSummary(): Promise<DashSummary> {
  return httpClient.get<DashSummary>('/dashboard/summary')
}
