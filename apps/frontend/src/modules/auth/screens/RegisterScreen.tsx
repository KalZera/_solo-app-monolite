import { useRouter } from 'expo-router'
import { ScrollView, Text, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { RegisterForm } from '../components/RegisterForm'

export function RegisterScreen() {
  const router = useRouter()

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$5" gap="$6">
        <YStack alignItems="center" gap="$2">
          <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
            The System
          </Text>
          <Text color="$soloText" fontSize={32} fontWeight="800" textAlign="center">
            Hunter Registration
          </Text>
          <Text color="$soloTextMuted" fontSize="$4" textAlign="center">
            Awaken as a Hunter and answer the System&apos;s call.
          </Text>
        </YStack>

        <SystemPanel width="100%" maxWidth={380} gap="$4">
          <RegisterForm onSuccess={() => router.replace('/home')} />

          <SystemButton chromeless onPress={() => router.replace('/login')}>
            Already a Hunter? Log in
          </SystemButton>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
