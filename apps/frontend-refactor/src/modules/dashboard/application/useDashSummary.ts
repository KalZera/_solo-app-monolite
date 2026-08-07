import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../infrastructure/dashboard.requests'

export function useDashSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
    retry: false,
  })
}
