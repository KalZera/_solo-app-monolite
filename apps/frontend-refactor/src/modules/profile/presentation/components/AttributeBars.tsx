import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ProgressBar, Text } from '@/shared/components'
import { Brain, Dumbbell, Heart, Star, Wind, type LucideIcon } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import type { CharacterStats, StatKey } from '../../domain/character.types'

// Order mirrors the STATUS mockup (Strength, Agility, Vitality, Intelligence, Luck).
const DISPLAY_ORDER: StatKey[] = ['strength', 'agility', 'vitality', 'intelligence', 'luck']

const statIcon: Record<StatKey, LucideIcon> = {
  strength: Dumbbell,
  agility: Wind,
  vitality: Heart,
  intelligence: Brain,
  luck: Star,
}

export function AttributeBars({ stats }: { stats?: CharacterStats }) {
  const { t } = useTranslation()
  const values = DISPLAY_ORDER.map((key) => stats?.[key] ?? 0)
  const max = Math.max(...values, 1)

  return (
    <View className="gap-2.5">
      {DISPLAY_ORDER.map((key, index) => {
        const Icon = statIcon[key]
        return (
          <View key={key} className="flex-row items-center gap-2">
            <Icon size={16} color={colors.primary} />
            <Text
              numberOfLines={1}
              className="w-24 text-[11px] uppercase tracking-wide text-primary-hover font-semibold"
            >
              {t(`character.stats.${key}`)}
            </Text>
            <ProgressBar value={values[index]} max={max} className="flex-1" />
            <Text weight="bold" className="w-7 text-right text-xs text-content">
              {values[index]}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
