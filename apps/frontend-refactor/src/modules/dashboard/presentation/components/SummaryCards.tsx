import { View } from 'react-native'
import { Panel, Text } from '@/shared/components'
import { useTranslation } from 'react-i18next'

export interface SummaryStat {
  label: string
  value: string
  unit?: string
}

export function SummaryCards({ stats }: { stats: SummaryStat[] }) {
  const { t } = useTranslation()
  return (
    <Panel>
      <View className="flex flex-row items-center gap-2 pl-2 pb-2">
        {/* {!!icon ? icon : null} */}
        <Text className="text-[11px] uppercase tracking-[2px] text-content font-bold">
          {t('dashboard.dash.summary')}
        </Text>
      </View>
      <View className="flex-row gap-3">
        {stats.map((stat) => (
          <View
            key={stat.label}
            className="flex-1 items-center rounded-xl border border-line bg-black/15 px-2 py-3"
          >
            <Text
              numberOfLines={2}
              className="text-center text-[10px] uppercase tracking-wide text-content font-semibold"
            >
              {stat.label}
            </Text>
            <View className="mt-2 flex-row items-baseline gap-1">
              <Text weight="bold" className="text-3xl text-primary">
                {stat.value}
              </Text>
              {stat.unit ? (
                <Text className="text-[12px] uppercase text-content">{stat.unit}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </Panel>
  )
}
