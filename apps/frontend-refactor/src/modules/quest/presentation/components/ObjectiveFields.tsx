import { useEffect } from 'react'
import { useFieldArray, type Control } from 'react-hook-form'
import { Pressable, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ControlledInput, Text } from '@/shared/components'
import { Plus, Trash2 } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import type { CreateQuestFormInput } from '../../schemas/create-quest.schema'

interface ObjectiveFieldsProps {
  control: Control<CreateQuestFormInput>
}

/** Dynamic list of quest objectives backed by RHF `useFieldArray`. */
export function ObjectiveFields({ control }: ObjectiveFieldsProps) {
  const { t } = useTranslation()
  const { fields, append, remove } = useFieldArray({ control, name: 'objectives' })

  useEffect(() => {
    // Skip when the form already starts with objectives (e.g. the "recreate quest" prefill) —
    // only nudge with a default one when the list is genuinely empty.
    if (fields.length > 0) return
    const initial = { description: 'Concluir no prazo', target: 1 }
    append(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text weight="semibold" className="text-xs uppercase tracking-widest text-content-muted">
          {t('quest.create.sectionObjectives')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => append({ description: '', target: '' })}
          className="flex-row items-center gap-1 rounded-lg border border-line px-2.5 py-1.5"
        >
          <Plus size={14} color={colors.primary} />
          <Text weight="semibold" className="text-xs text-primary">
            {t('quest.create.addObjective')}
          </Text>
        </Pressable>
      </View>

      {fields.length === 0 ? (
        <Text className="text-xs text-content-muted">{t('quest.create.objectivesHint')}</Text>
      ) : null}

      {fields.map((field, index) => (
        <View key={field.id} className="flex-row items-end gap-2">
          <View className="flex-1">
            <ControlledInput
              control={control}
              name={`objectives.${index}.description`}
              label={t('quest.create.objectiveDescription', { number: index + 1 })}
              inputProps={{ placeholder: t('quest.create.objectivePlaceholder') }}
            />
          </View>
          <View className="w-20">
            <ControlledInput
              control={control}
              name={`objectives.${index}.target`}
              label={t('quest.create.target')}
              inputProps={{ placeholder: '1', keyboardType: 'numeric' }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={fields.length === 1}
            accessibilityLabel={t('quest.create.removeObjective')}
            onPress={() => remove(index)}
            className="h-12 w-10 items-center justify-center rounded-xl border border-line"
          >
            <Trash2 size={16} color={fields.length === 1 ? colors.contentMuted : colors.danger} />
          </Pressable>
        </View>
      ))}
    </View>
  )
}
