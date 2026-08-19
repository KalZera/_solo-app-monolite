import { useWindowDimensions, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { BottomSheet, HintedScrollView, Text } from '@/shared/components'
import { Brain, Dumbbell, Eye, Heart, Wind, type LucideIcon } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import type { AttributeKey } from '../../domain/dashboard.types'

interface AttributeGuideSheetProps {
  visible: boolean
  onClose: () => void
}

// Order + icon per attribute — mirrors AttributeGrid so the guide reads in the same sequence.
const ATTRIBUTES: { key: AttributeKey; Icon: LucideIcon }[] = [
  { key: 'strength', Icon: Dumbbell },
  { key: 'intelligence', Icon: Brain },
  { key: 'agility', Icon: Wind },
  { key: 'vitality', Icon: Heart },
  { key: 'perception', Icon: Eye },
]

/**
 * Reference sheet that explains what each Hunter attribute represents (its real-life realm).
 * Opened from the icon button next to the "Attributes" panel on the dashboard.
 */
export function AttributeGuideSheet({ visible, onClose }: AttributeGuideSheetProps) {
  const { t } = useTranslation()
  const { height } = useWindowDimensions()

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('dashboard.attributeGuide.title')}
      message={t('dashboard.attributeGuide.subtitle')}
    >
      <HintedScrollView style={{ maxHeight: height * 0.55 }}>
        <View className="gap-3">
          {ATTRIBUTES.map(({ key, Icon }) => (
            <View
              key={key}
              className="flex-row items-start gap-3 rounded-lg border border-line bg-surface-raised/40 p-3"
            >
              <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                <Icon size={18} color={colors.primary} />
              </View>
              <View className="flex-1 gap-1">
                <Text weight="bold" className="text-sm uppercase tracking-[1px] text-content">
                  {t(`dashboard.stats.${key}`)}
                </Text>
                <Text className="text-[13px] leading-5 text-content-muted">
                  {t(`dashboard.attributeGuide.descriptions.${key}`)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </HintedScrollView>
    </BottomSheet>
  )
}
