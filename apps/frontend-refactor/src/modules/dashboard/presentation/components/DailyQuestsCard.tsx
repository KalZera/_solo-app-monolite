import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Badge, Panel, ProgressBar, Text } from '@/shared/components'
import type { DashboardSummary } from '../../domain/dashboard.types'

export function DailyQuestsCard({ summary }: { summary: DashboardSummary }) {
  const { t } = useTranslation()
  const { completed, total } = summary.dailyQuests

  return (
    <Panel className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text weight="semibold" className="text-base text-content">
          {t('dashboard.dailyQuests')}
        </Text>
        <Badge label={t('dashboard.streakUnit', { count: summary.streakDays })} tone="warning" />
      </View>
      <ProgressBar value={completed} max={total} tone="success" />
      <Text className="text-xs text-content-muted">
        {t('dashboard.questsProgress', { completed, total })}
      </Text>
    </Panel>
  )
}
