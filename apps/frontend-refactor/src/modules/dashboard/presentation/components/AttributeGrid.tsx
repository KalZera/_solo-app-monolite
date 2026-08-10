import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Panel, Text } from '@/shared/components'
import { Brain, Dumbbell, Eye, Heart, Wind, type LucideIcon } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import type { AttributeKey, HunterAttribute } from '../../domain/dashboard.types'

const attributeIcon: Record<AttributeKey, LucideIcon> = {
  strength: Dumbbell,
  agility: Wind,
  intelligence: Brain,
  vitality: Heart,
  luck: Eye,
}

export function AttributeGrid({ attributes }: { attributes: HunterAttribute }) {
  const { t } = useTranslation()
  return (
    <>
      <View className="flex-row flex-wrap gap-3">
        {(Object.entries(attributes) as [AttributeKey, number][]).map(([key, value]) => {
          const Icon = attributeIcon[key]
          return (
            <View
              key={key}
              className="min-w-[30%] flex-1 flex-row items-center gap-3 rounded-xl border border-line bg-surface/60 p-3"
            >
              <Icon size={20} color={colors.primary} />
              <View>
                <Text weight="bold" className="text-lg text-content">
                  {value}
                </Text>
                <Text className="text-[11px] text-content-muted">
                  {t(`dashboard.stats.${key}`)}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </>
  )
}
