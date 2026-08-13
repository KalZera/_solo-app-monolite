import { useWindowDimensions, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { BottomSheet, HintedScrollView, Text } from '@/shared/components'
import { CHARACTER_CLASSES } from '../../domain/character.types'

interface ClassGuideSheetProps {
  visible: boolean
  onClose: () => void
}

/**
 * Reference sheet that lists every Hunter class (each a "focus area") with its description.
 * Opened from the class field in CreateCharacterForm so Hunters can browse before choosing.
 */
export function ClassGuideSheet({ visible, onClose }: ClassGuideSheetProps) {
  const { t } = useTranslation()
  const { height } = useWindowDimensions()

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('character.classGuide.title')}
      message={t('character.classGuide.subtitle')}
    >
      <HintedScrollView style={{ maxHeight: height * 0.55 }}>
        <View className="gap-3">
          {CHARACTER_CLASSES.map((value) => (
            <View
              key={value}
              className="gap-1 rounded-lg border border-line bg-surface-raised/40 p-3"
            >
              <Text weight="bold" className="text-sm uppercase tracking-[1px] text-content">
                {t(`character.classes.${value}`)}
              </Text>
              <Text className="text-[13px] leading-5 text-content-muted">
                {t(`character.classDescriptions.${value}`)}
              </Text>
            </View>
          ))}
        </View>
      </HintedScrollView>
    </BottomSheet>
  )
}
