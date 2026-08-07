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
  perception: Eye,
}

export function AttributeGrid({ attributes }: { attributes: HunterAttribute[] }) {
  const { t } = useTranslation()

  return (
    <Panel className="gap-4">
      <Text weight="semibold" className="text-xs uppercase tracking-widest text-content-muted">
        {t('dashboard.attributes')}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {attributes.map((attribute) => {
          const Icon = attributeIcon[attribute.key]
          return (
            <View
              key={attribute.key}
              className="min-w-[30%] flex-1 flex-row items-center gap-3 rounded-xl border border-line bg-surface/60 p-3"
            >
              <Icon size={20} color={colors.primary} />
              <View>
                <Text weight="bold" className="text-lg text-content">
                  {attribute.value}
                </Text>
                <Text className="text-[11px] text-content-muted">
                  {t(`dashboard.stats.${attribute.key}`)}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </Panel>
  )
}
