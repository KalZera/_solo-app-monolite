import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { Button, ControlledInput, Select, Text } from '@/shared/components'
import { Info } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { CHARACTER_CLASSES } from '../../domain/character.types'
import { useCreateCharacter } from '../../application/useCreateCharacter'
import {
  createCharacterSchema,
  type CreateCharacterFormValues,
} from '../../schemas/create-character.schema'
import { ClassGuideSheet } from './ClassGuideSheet'

export function CreateCharacterForm() {
  const { t } = useTranslation()
  const createCharacter = useCreateCharacter()
  const schema = useMemo(() => createCharacterSchema(t), [t])
  const [classGuideVisible, setClassGuideVisible] = useState(false)

  const { control, handleSubmit } = useForm<CreateCharacterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', title: '', class: 'athlete' },
  })

  const classOptions = CHARACTER_CLASSES.map((value) => ({
    label: t(`character.classes.${value}`),
    value,
  }))

  return (
    <View className="gap-4">
      <ControlledInput
        control={control}
        name="name"
        label={t('character.create.name')}
        inputProps={{ placeholder: t('character.create.namePlaceholder') }}
      />
      <ControlledInput
        control={control}
        name="title"
        label={t('character.create.titleField')}
        inputProps={{ placeholder: t('character.create.titlePlaceholder') }}
      />
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <Text weight="semibold" className="text-xs uppercase tracking-widest text-content-muted">
            {t('character.create.class')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setClassGuideVisible(true)}
            hitSlop={8}
            className="flex-row items-center gap-1 rounded border border-line px-2 py-1 active:bg-surface-raised"
          >
            <Info size={13} color={colors.primary} />
            <Text weight="semibold" className="text-[11px] uppercase tracking-[1px] text-primary">
              {t('character.create.viewClasses')}
            </Text>
          </Pressable>
        </View>
        <Controller
          control={control}
          name="class"
          render={({ field }) => (
            <Select options={classOptions} value={field.value} onChange={field.onChange} />
          )}
        />
      </View>
      <Button
        label={
          createCharacter.isPending
            ? t('character.create.submitting')
            : t('character.create.submit')
        }
        loading={createCharacter.isPending}
        onPress={handleSubmit((values) => createCharacter.mutate(values))}
        className="mt-2"
      />

      <ClassGuideSheet visible={classGuideVisible} onClose={() => setClassGuideVisible(false)} />
    </View>
  )
}
