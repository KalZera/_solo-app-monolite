import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Screen, ScreenHeader } from '@/shared/components'
import { AvatarCropper } from '../components/AvatarCropper'

export function AvatarEditorScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Screen scroll>
      <ScreenHeader
        title={t('profile.avatar.title')}
        eyebrow={t('common.systemLabel')}
        onBack={() => router.back()}
      />
      <AvatarCropper />
    </Screen>
  )
}
