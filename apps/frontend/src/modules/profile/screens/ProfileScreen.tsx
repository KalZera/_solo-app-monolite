import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { useSession } from '@/modules/auth/session/SessionProvider'
import { useCharacterProfile } from '@/modules/character/api/useCharacterProfile'
import { SystemButton } from '@/shared/components/SystemButton'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { useLanguage } from '@/shared/i18n/useLanguage'

const LANGUAGE_LABEL_KEYS = {
  en: 'profile.languageEnglish',
  pt: 'profile.languagePortuguese',
} as const

export function ProfileScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { signOut } = useSession()
  const { data: character } = useCharacterProfile()
  const { language, setLanguage, supportedLanguages } = useLanguage()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleLogOff() {
    setIsSigningOut(true)
    await signOut()
    router.replace('/login')
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} alignItems="center" padding="$5" paddingTop="$8" gap="$5">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          {t('profile.title')}
        </Text>

        <SystemPanel width="100%" maxWidth={420} gap="$4">
          <YStack alignItems="center" gap="$1">
            <Text color="$soloText" fontSize={24} fontWeight="800">
              {character?.name ?? t('profile.defaultName')}
            </Text>
            <Text color="$soloTextMuted" fontSize="$3">
              {character ? `${character.title} · ${t('character.screen.rank')} ${character.rank}` : ' '}
            </Text>
          </YStack>

          <SystemButton onPress={handleLogOff} disabled={isSigningOut}>
            {isSigningOut ? t('profile.loggingOff') : t('profile.logOff')}
          </SystemButton>
        </SystemPanel>

        <SystemPanel width="100%" maxWidth={420} gap="$3">
          <Text color="$soloTextMuted" fontSize="$2" letterSpacing={1} textTransform="uppercase">
            {t('profile.language')}
          </Text>
          <XStack gap="$2">
            {supportedLanguages.map((option) => (
              <SystemButton
                key={option}
                flex={1}
                backgroundColor={language === option ? '$soloBlue' : '$soloPanelAlt'}
                borderColor={language === option ? '$soloCyan' : '$soloBorder'}
                onPress={() => setLanguage(option)}
              >
                {t(LANGUAGE_LABEL_KEYS[option])}
              </SystemButton>
            ))}
          </XStack>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
