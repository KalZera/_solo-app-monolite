import { Redirect } from 'expo-router'
import { useSessionStore } from '@/modules/auth/application/session.store'

export default function Index() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const isLoading = useSessionStore((state) => state.isLoading)

  if (isLoading) return null

  return <Redirect href={isAuthenticated ? '/dashboard' : '/login'} />
}
