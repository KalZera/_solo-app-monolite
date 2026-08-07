import { useQuery } from '@tanstack/react-query'
import { dashboardMock } from '../infrastructure/dashboard.mock'
import type { DashboardSummary } from '../domain/dashboard.types'
import { getDashboardSummary } from '../infrastructure/dashboard.requests'
import { getCharacterProfile } from '@/modules/profile/infrastructure/character.requests'

async function fetchDashboard(): Promise<DashboardSummary> {
  // Mocked: simulate latency so loading states are exercised.
  const summary = await getDashboardSummary()
  const character = await getCharacterProfile()

  // const dashboardData: DashboardSummary = {
  //   name: character.name,
  //   rank: character.rank || 'E',
  //   level: character.level || 0,
  //   power: character.powerScore || 0,
  //   xp: character.experience || 0,
    
  // }
  return dashboardMock
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard
  })
}
