import { Pressable, View } from 'react-native'
import { Text } from './Text'
import { cn } from '../utils/cn'

export interface SelectOption<T extends string> {
  label: string
  value: T
  hint?: string
}

interface SelectProps<T extends string> {
  options: SelectOption<T>[]
  value: T | null
  onChange: (value: T) => void
  className?: string
}

/** Wrapping pill selector — a keyboard-free alternative to a native picker. */
export function Select<T extends string>({ options, value, onChange, className }: SelectProps<T>) {
  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={cn(
              'rounded-lg border px-3.5 py-2',
              selected ? 'border-primary bg-primary/15' : 'border-line bg-surface',
            )}
          >
            <Text
              weight={selected ? 'semibold' : 'medium'}
              className={cn('text-sm', selected ? 'text-primary' : 'text-content')}
            >
              {option.label}
            </Text>
            {option.hint ? (
              <Text className={cn('text-[11px]', selected ? 'text-primary' : 'text-content-muted')}>
                {option.hint}
              </Text>
            ) : null}
          </Pressable>
        )
      })}
    </View>
  )
}
