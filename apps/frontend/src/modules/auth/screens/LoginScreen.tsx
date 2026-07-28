import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { LoginForm } from '../components/LoginForm'

export function LoginScreen() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$5" gap="$6">
        <YStack alignItems="center" gap="$2">
          <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
            {t('auth.systemLabel')}
          </Text>
          <Text color="$soloText" fontSize={32} fontWeight="800" textAlign="center">
            {t('auth.login.appName')}
          </Text>
          <Text color="$soloTextMuted" fontSize="$4" textAlign="center">
            {t('auth.login.subtitle')}
          </Text>
        </YStack>

        <SystemPanel width="100%" maxWidth={380} gap="$4">
          <LoginForm onSuccess={() => router.replace('/home')} />

          <SystemButton chromeless onPress={() => router.push('/register')}>
            {t('auth.login.registerLink')}
          </SystemButton>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
