import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Loading, Panel, Screen, ScreenHeader, Text } from '@/shared/components'
import { useDashboard } from '../../application/useDashboard'
import { HunterCard } from '../components/HunterCard'
import { AttributeGrid } from '../components/AttributeGrid'
import { DailyQuestsCard } from '../components/DailyQuestsCard'
import { SummaryCards } from '../components/SummaryCards'
// import { ProgressCard } from '../components/ProgressCard'
import { AttributeRadar } from '../components/AttributeRadar'

const RADAR_ORDER = ['strength', 'agility', 'vitality', 'intelligence', 'luck'] as const

export function DashboardScreen() {
  const { t } = useTranslation()
  const { data, isLoading } = useDashboard()

  const summaryStats = [
    {
      label: t('dashboard.dash.completedQuests'),
      value: (data?.questsCompletedToday ?? 0).toLocaleString(),
    },
    {
      label: t('dashboard.dash.streak'),
      value: (data?.streakDays ?? 0).toLocaleString(),
      unit: t('dashboard.dash.streakUnit'),
    },
    {
      label: t('dashboard.dash.pointsToday'),
      value: (data?.xpToday ?? 0).toLocaleString(),
    },
  ]

  const radarStats = RADAR_ORDER.map((key) => ({
    label: t(`character.stats.${key}`),
    value: data?.attributes?.[key] ?? 0,
  }))

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
          <HunterCard summary={data} />
          <SummaryCards stats={summaryStats} />
          <Panel>
            {/* <View className="flex flex-row items-center "> */}
            <Text className="text-[11px] uppercase tracking-[2px] text-content font-bold">
              {t('dashboard.attributes')}
            </Text>
            {/* </View> */}
            <AttributeRadar stats={radarStats} />
            <AttributeGrid attributes={data.attributes} />
          </Panel>
          <DailyQuestsCard summary={data} />
        </View>
      )}
    </Screen>
  )
}
