import { View } from 'react-native'
import { Text } from '@/shared/components'

export interface SummaryStat {
  label: string
  value: string
  unit?: string
}

export function SummaryCards({ stats }: { stats: SummaryStat[] }) {
  return (
    <View className="flex-row gap-3">
      {stats.map((stat) => (
        <View
          key={stat.label}
          className="flex-1 items-center rounded-xl border border-line bg-black/15 px-2 py-3"
        >
          <Text
            numberOfLines={2}
            className="text-center text-[9px] uppercase tracking-wide text-content-muted"
          >
            {stat.label}
          </Text>
          <View className="mt-2 flex-row items-baseline gap-1">
            <Text weight="bold" className="text-2xl text-primary">
              {stat.value}
            </Text>
            {stat.unit ? (
              <Text className="text-[9px] uppercase text-content-muted">{stat.unit}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  )
}
