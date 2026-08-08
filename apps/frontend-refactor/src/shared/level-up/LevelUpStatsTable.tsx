import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from '../components/Text'
import { ChevronsRight } from '../components/icons'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'
import type { LevelUpStatChange } from './level-up.types'

/** The old » new attribute table shown inside the level-up modal. */
export function LevelUpStatsTable({ stats }: { stats: LevelUpStatChange[] }) {
  const { t } = useTranslation()

  if (stats.length === 0) return null

  return (
    <View className="rounded-xl border border-primary/25 bg-black/20">
      {stats.map((stat, index) => (
        <View
          key={stat.key}
          className={cn(
            'flex-row items-center px-3.5 py-2 gap-2',
            index > 0 && 'border-t border-primary/10',
          )}
        >
          <Text className="flex-1 text-xs uppercase tracking-wide text-content">
            {t(`character.stats.${stat.key}`)}
          </Text>
          <Text className="text-right text-xs text-content">{stat.from}</Text>
          <View className="items-center">
            <ChevronsRight size={16} color={colors.primary} />
          </View>
          <Text weight="semibold" className="text-right text-xs text-primary">
            {stat.to}
          </Text>
        </View>
      ))}
    </View>
  )
}
