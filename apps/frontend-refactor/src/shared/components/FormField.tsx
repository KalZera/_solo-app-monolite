import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from './Text'
import { cn } from '../utils/cn'

interface FormFieldProps {
  label?: string
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

/** Label + control + error/hint. Purely presentational — pair with RHF Controller. */
export function FormField({ label, error, hint, children, className }: FormFieldProps) {
  return (
    <View className={cn('gap-1.5', className)}>
      {label ? (
        <Text weight="semibold" className="text-xs uppercase tracking-widest text-content-muted">
          {label}
        </Text>
      ) : null}
      {children}
      {error ? (
        <Text className="text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-content-muted">{hint}</Text>
      ) : null}
    </View>
  )
}
