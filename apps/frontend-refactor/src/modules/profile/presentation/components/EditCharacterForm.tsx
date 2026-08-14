import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Button, ControlledInput } from '@/shared/components'
import { useUpdateCharacter } from '../../application/useUpdateCharacter'
import type { CharacterProfile } from '../../domain/character.types'
import {
  editCharacterSchema,
  type EditCharacterFormValues,
} from '../../schemas/edit-character.schema'
import { ClassField } from './ClassField'

interface EditCharacterFormProps {
  profile: CharacterProfile
}

/** Edits the Hunter's cosmetic fields (title + class). Name and attributes are not editable here. */
export function EditCharacterForm({ profile }: EditCharacterFormProps) {
  const { t } = useTranslation()
  const updateCharacter = useUpdateCharacter()
  const schema = useMemo(() => editCharacterSchema(t), [t])

  const { control, handleSubmit } = useForm<EditCharacterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: profile.title ?? '',
      class: profile.class ?? 'athlete',
    },
  })

  return (
    <View className="gap-4">
      <ControlledInput
        control={control}
        name="title"
        label={t('character.create.titleField')}
        inputProps={{ placeholder: t('character.create.titlePlaceholder') }}
      />
      <Controller
        control={control}
        name="class"
        render={({ field }) => <ClassField value={field.value} onChange={field.onChange} />}
      />
      <Button
        label={
          updateCharacter.isPending ? t('character.edit.submitting') : t('character.edit.submit')
        }
        loading={updateCharacter.isPending}
        onPress={handleSubmit((values) => updateCharacter.mutate(values))}
        className="mt-2"
      />
    </View>
  )
}
