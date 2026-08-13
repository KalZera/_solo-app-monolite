import { useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, Loading, Screen, ScreenHeader } from '@/shared/components'
import { BookOpen, LogOut } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { useSession } from '@/modules/auth/application/useSession'
import { TutorialSheet } from '@/modules/tutorial/presentation/TutorialSheet'
import { useCharacterProfile } from '../../application/useCharacterProfile'
import { ProfileHeader } from '../components/ProfileHeader'
import { LanguageSelector } from '../components/LanguageSelector'

export function ProfileScreen() {
  const { t } = useTranslation()
  const { signOut } = useSession()
  const { data, isLoading } = useCharacterProfile()
  const [signingOut, setSigningOut] = useState(false)
  const [tutorialVisible, setTutorialVisible] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        eyebrow={t('common.systemLabel')}
      />

      {isLoading ? (
        <Loading label={t('common.loading')} />
      ) : (
        <View className="gap-5">
          <ProfileHeader profile={data ?? null} />
          <LanguageSelector />
          <Button
            label={t('profile.showTutorial')}
            variant="secondary"
            icon={<BookOpen size={16} color={colors.content} />}
            onPress={() => setTutorialVisible(true)}
          />
          <Button
            label={signingOut ? t('profile.loggingOff') : t('profile.logOff')}
            variant="danger"
            loading={signingOut}
            icon={<LogOut size={16} color={colors.content} />}
            onPress={handleSignOut}
          />
        </View>
      )}

      <TutorialSheet visible={tutorialVisible} onClose={() => setTutorialVisible(false)} />
    </Screen>
  )
}
