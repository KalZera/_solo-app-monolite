import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { RegisterForm } from '../components/RegisterForm'

export function RegisterScreen() {
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
            {t('auth.register.heading')}
          </Text>
          <Text color="$soloTextMuted" fontSize="$4" textAlign="center">
            {t('auth.register.subtitle')}
          </Text>
        </YStack>

        <SystemPanel width="100%" maxWidth={380} gap="$4">
          <RegisterForm onSuccess={() => router.replace('/home')} />

          <SystemButton chromeless onPress={() => router.replace('/login')}>
            {t('auth.register.loginLink')}
          </SystemButton>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
