import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Loading, Screen, ScreenHeader, SystemNotice } from '@/shared/components'
import { useDashboard } from '../../application/useDashboard'
import { HunterCard } from '../components/HunterCard'
import { AttributeGrid } from '../components/AttributeGrid'
import { DailyQuestsCard } from '../components/DailyQuestsCard'

export function DashboardScreen() {
  const { t } = useTranslation()
  const { data, isLoading } = useDashboard()

  return (
    <Screen scroll>
      <ScreenHeader
        title={t('dashboard.title')}
        subtitle={data ? t('dashboard.greeting', { name: data.name }) : undefined}
        eyebrow={t('common.systemLabel')}
      />

      {isLoading || !data ? (
        <Loading label={t('common.loading')} />
      ) : (
        <View className="gap-5">
          <SystemNotice message={t('common.mockedNotice')} />
          <HunterCard summary={data} />
          <AttributeGrid attributes={data.attributes} />
          <DailyQuestsCard summary={data} />
        </View>
      )}
    </Screen>
  )
}
