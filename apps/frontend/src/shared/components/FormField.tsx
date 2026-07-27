import type { ComponentProps } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Text, YStack } from 'tamagui'
import { SystemInput } from './SystemInput'

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  inputProps?: ComponentProps<typeof SystemInput>
}

export function FormField<T extends FieldValues>({ control, name, label, inputProps }: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <YStack gap="$2">
          <Text color="$soloTextMuted" fontSize="$2" letterSpacing={1} textTransform="uppercase">
            {label}
          </Text>
          <SystemInput
            value={typeof value === 'string' ? value : ''}
            onChangeText={onChange}
            onBlur={onBlur}
            borderColor={error ? '$soloDanger' : undefined}
            {...inputProps}
          />
          {error?.message && (
            <Text color="$soloDanger" fontSize="$1">
              {error.message}
            </Text>
          )}
        </YStack>
      )}
    />
  )
}
