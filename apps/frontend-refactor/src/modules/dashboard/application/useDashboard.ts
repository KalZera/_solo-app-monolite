import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../infrastructure/dashboard.requests'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary
  })
}
