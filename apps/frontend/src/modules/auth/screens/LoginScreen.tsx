import { useRouter } from 'expo-router'
import { ScrollView, Text, YStack } from 'tamagui'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { LoginForm } from '../components/LoginForm'

export function LoginScreen() {
  const router = useRouter()

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$5" gap="$6">
        <YStack alignItems="center" gap="$2">
          <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
            The System
          </Text>
          <Text color="$soloText" fontSize={32} fontWeight="800" textAlign="center">
            Solo Leveling
          </Text>
          <Text color="$soloTextMuted" fontSize="$4" textAlign="center">
            Only a Hunter registered with the System may proceed.
          </Text>
        </YStack>

        <SystemPanel width="100%" maxWidth={380}>
          <LoginForm onSuccess={() => router.replace('/home')} />
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
