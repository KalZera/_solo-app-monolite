import { httpClient } from '@/shared/api/http-client'
import type { DashboardSummary } from '../domain/dashboard.types'

export interface DashSummary {
  completedQuests: number
  streakDays: number
  pointsToday: number
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return httpClient.get<DashboardSummary>('/dashboard/summary')
}
