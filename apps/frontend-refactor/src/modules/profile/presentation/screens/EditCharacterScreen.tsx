import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Loading, Panel, Screen, ScreenHeader, SystemNotice, Text } from '@/shared/components'
import { getErrorMessage } from '@/shared/api/api-error'
import { useCharacterProfile } from '../../application/useCharacterProfile'
import { EditCharacterForm } from '../components/EditCharacterForm'

export function EditCharacterScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data, isLoading, isError, error, refetch } = useCharacterProfile()

  return (
    <Screen scroll>
      <ScreenHeader
        title={t('character.edit.title')}
        subtitle={t('character.edit.subtitle')}
        eyebrow={t('common.systemLabel')}
        onBack={() => router.back()}
      />

      {isLoading ? (
        <Loading label={t('common.loading')} />
      ) : isError || !data ? (
        <View className="gap-4">
          <SystemNotice variant="error" message={getErrorMessage(error)} />
          <Text className="text-center text-primary" onPress={() => refetch()}>
            {t('common.retry')}
          </Text>
        </View>
      ) : (
        <Panel>
          <EditCharacterForm profile={data} />
        </Panel>
      )}
    </Screen>
  )
}
