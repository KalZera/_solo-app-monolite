import { Redirect } from 'expo-router'
import { useSession } from '@/modules/auth/session/SessionProvider'

export default function Index() {
  const { isAuthenticated, isLoading } = useSession()

  if (isLoading) {
    return null
  }

  return <Redirect href={isAuthenticated ? '/home' : '/login'} />
}
