import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { FormField } from '@/shared/components/FormField'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useCreateCharacter } from '../api/useCreateCharacter'
import { CLASS_OPTIONS, createCharacterSchema, type CreateCharacterFormValues } from '../schemas/create-character.schema'

export function CreateCharacterForm() {
  const { t } = useTranslation()
  const createCharacter = useCreateCharacter()
  const characterSchema = useMemo(() => createCharacterSchema(t), [t])
  const { control, handleSubmit } = useForm<CreateCharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: { name: '', title: '', class: undefined },
  })

  function onSubmit(values: CreateCharacterFormValues) {
    createCharacter.mutate(values)
  }

  return (
    <YStack gap="$4">
      <YStack alignItems="center" gap="$1">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          {t('character.createForm.heading')}
        </Text>
        <Text color="$soloText" fontSize={22} fontWeight="800" textAlign="center">
          {t('character.createForm.title')}
        </Text>
        <Text color="$soloTextMuted" fontSize="$3" textAlign="center">
          {t('character.createForm.subtitle')}
        </Text>
      </YStack>

      <FormField
        control={control}
        name="name"
        label={t('character.createForm.name')}
        inputProps={{ placeholder: t('character.createForm.namePlaceholder'), autoCapitalize: 'words' }}
      />

      <FormField
        control={control}
        name="title"
        label={t('character.createForm.titleField')}
        inputProps={{ placeholder: t('character.createForm.titlePlaceholder'), autoCapitalize: 'words' }}
      />

      <Controller
        control={control}
        name="class"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" letterSpacing={1} textTransform="uppercase">
              {t('character.createForm.class')}
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {CLASS_OPTIONS.map((option) => (
                <SystemButton
                  key={option}
                  size="$3"
                  backgroundColor={value === option ? '$soloBlue' : '$soloPanelAlt'}
                  borderColor={value === option ? '$soloCyan' : '$soloBorder'}
                  onPress={() => onChange(option)}
                >
                  {t(`character.classes.${option}`)}
                </SystemButton>
              ))}
            </XStack>
            {error?.message && (
              <Text color="$soloDanger" fontSize="$1">
                {error.message}
              </Text>
            )}
          </YStack>
        )}
      />

      {createCharacter.isError && (
        <Text color="$soloDanger" fontSize="$2">
          {getErrorMessage(createCharacter.error)}
        </Text>
      )}

      <SystemButton onPress={handleSubmit(onSubmit)} disabled={createCharacter.isPending}>
        {createCharacter.isPending ? t('character.createForm.submitting') : t('character.createForm.submit')}
      </SystemButton>
    </YStack>
  )
}
