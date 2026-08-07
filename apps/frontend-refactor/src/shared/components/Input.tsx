import { forwardRef } from 'react'
import { TextInput, type TextInputProps } from 'react-native'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'

export interface InputProps extends TextInputProps {
  hasError?: boolean
  className?: string
  multiline?: boolean
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { hasError, className, multiline, style, ...props },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.contentMuted}
      multiline={multiline}
      className={cn(
        'rounded-xl border bg-surface px-4 py-3 font-rajdhani-medium text-base text-content',
        multiline ? 'min-h-24' : 'h-12',
        hasError ? 'border-danger' : 'border-line',
        className,
      )}
      style={[multiline ? { textAlignVertical: 'top' } : null, style]}
      {...props}
    />
  )
})
