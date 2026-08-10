import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Avatar, Badge, Panel, ProgressBar, Text } from '@/shared/components'
import type { DashboardSummary } from '../../domain/dashboard.types'

export function HunterCard({ summary }: { summary: DashboardSummary }) {
  const { t } = useTranslation()
  const remainingToLevel = Math.max(0, summary.xpToNext - summary.xp)
  console.log({
    cond: summary.xpToNext - summary.xpCurrentLevel,
    remainingToLevel,
    rem: summary.xpRemaining,
  })
  return (
    <Panel className="gap-4">
      <View className="flex-row items-center gap-4">
        <Avatar name={summary.name} size={72} />
        <View className="flex-1 gap-1.5">
          <Text weight="bold" className="text-xl text-content uppercase">
            {summary.name}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Badge label={`${t('dashboard.rank')} ${summary.rank}`} tone="legendary" />
            <Badge label={`${t('dashboard.level')} ${summary.level}`} tone="primary" />
          </View>
        </View>
        <View className="items-end">
          <Text className="text-[11px] uppercase tracking-wider text-content font-bold">
            {t('dashboard.power')}
          </Text>
          <Text weight="bold" className="text-4xl text-primary">
            {summary.power.toLocaleString()}
          </Text>
        </View>
      </View>

      <View className="gap-1.5">
        <View className="flex-row justify-between">
          <Text className="text-xs text-content uppercase font-bold">
            {t('dashboard.experience')}
          </Text>
          <Text className="text-xs text-content font-semibold">
            {summary.xp} / {summary.xpToNext}
          </Text>
        </View>
        <ProgressBar
          value={summary.xpRemaining - remainingToLevel}
          max={summary.xpRemaining}
          tone="legendary"
        />
        <Text className="text-[11px] text-content font-semibold">
          {t('dashboard.toNextLevel', { xp: remainingToLevel })}
        </Text>
      </View>
    </Panel>
  )
}
