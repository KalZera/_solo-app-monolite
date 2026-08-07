import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Button, ControlledInput, FormField, Select } from '@/shared/components'
import { CHARACTER_CLASSES } from '../../domain/character.types'
import { useCreateCharacter } from '../../application/useCreateCharacter'
import {
  createCharacterSchema,
  type CreateCharacterFormValues,
} from '../../schemas/create-character.schema'

export function CreateCharacterForm() {
  const { t } = useTranslation()
  const createCharacter = useCreateCharacter()
  const schema = useMemo(() => createCharacterSchema(t), [t])

  const { control, handleSubmit } = useForm<CreateCharacterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', title: '', class: 'warrior' },
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
      <FormField label={t('character.create.class')}>
        <Controller
          control={control}
          name="class"
          render={({ field }) => (
            <Select options={classOptions} value={field.value} onChange={field.onChange} />
          )}
        />
      </FormField>
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
    </View>
  )
}
