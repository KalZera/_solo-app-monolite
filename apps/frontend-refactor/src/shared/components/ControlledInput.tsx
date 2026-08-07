import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { FormField } from './FormField'
import { Input, type InputProps } from './Input'

interface ControlledInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  hint?: string
  inputProps?: InputProps
}

/** RHF-bound text field: wires a `Controller` to the shared FormField + Input. */
export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  inputProps,
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField label={label} hint={hint} error={fieldState.error?.message}>
          <Input
            value={(field.value as string) ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            hasError={Boolean(fieldState.error)}
            {...inputProps}
          />
        </FormField>
      )}
    />
  )
}
