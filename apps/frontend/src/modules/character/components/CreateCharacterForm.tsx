import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Text, XStack, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { FormField } from '@/shared/components/FormField'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useCreateCharacter } from '../api/useCreateCharacter'
import { CLASS_OPTIONS, createCharacterSchema, type CreateCharacterFormValues } from '../schemas/create-character.schema'

export function CreateCharacterForm() {
  const createCharacter = useCreateCharacter()
  const { control, handleSubmit } = useForm<CreateCharacterFormValues>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: { name: '', title: '', class: undefined },
  })

  function onSubmit(values: CreateCharacterFormValues) {
    createCharacter.mutate(values)
  }

  return (
    <YStack gap="$4">
      <YStack alignItems="center" gap="$1">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          Registration
        </Text>
        <Text color="$soloText" fontSize={22} fontWeight="800" textAlign="center">
          Awaken as a Hunter
        </Text>
        <Text color="$soloTextMuted" fontSize="$3" textAlign="center">
          The System has no record of you yet. Register your Hunter to proceed.
        </Text>
      </YStack>

      <FormField control={control} name="name" label="Name" inputProps={{ placeholder: 'Sung Jinwoo', autoCapitalize: 'words' }} />

      <FormField
        control={control}
        name="title"
        label="Title"
        inputProps={{ placeholder: 'The Weakest Hunter', autoCapitalize: 'words' }}
      />

      <Controller
        control={control}
        name="class"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" letterSpacing={1} textTransform="uppercase">
              Class
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
                  {option.charAt(0).toUpperCase() + option.slice(1)}
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
        {createCharacter.isPending ? 'Registering…' : 'Register Hunter'}
      </SystemButton>
    </YStack>
  )
}
