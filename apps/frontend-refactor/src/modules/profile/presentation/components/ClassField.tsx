import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Select, Text } from '@/shared/components'
import { Info } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { CHARACTER_CLASSES, type CharacterClass } from '../../domain/character.types'
import { ClassGuideSheet } from './ClassGuideSheet'

interface ClassFieldProps {
  value: CharacterClass
  onChange: (value: CharacterClass) => void
}

/**
 * Class selector with a "view classes" button next to its label that opens the {@link ClassGuideSheet}
 * (all classes + descriptions). Decoupled from react-hook-form — wrap it in a Controller. Shared by
 * the create and edit character forms.
 */
export function ClassField({ value, onChange }: ClassFieldProps) {
  const { t } = useTranslation()
  const [guideVisible, setGuideVisible] = useState(false)

  const options = useMemo(
    () => CHARACTER_CLASSES.map((slug) => ({ label: t(`character.classes.${slug}`), value: slug })),
    [t],
  )

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text weight="semibold" className="text-xs uppercase tracking-widest text-content-muted">
          {t('character.create.class')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setGuideVisible(true)}
          hitSlop={8}
          className="flex-row items-center gap-1 rounded border border-line px-2 py-1 active:bg-surface-raised"
        >
          <Info size={13} color={colors.primary} />
          <Text weight="semibold" className="text-[11px] uppercase tracking-[1px] text-primary">
            {t('character.create.viewClasses')}
          </Text>
        </Pressable>
      </View>

      <Select options={options} value={value} onChange={onChange} />

      <ClassGuideSheet visible={guideVisible} onClose={() => setGuideVisible(false)} />
    </View>
  )
}
