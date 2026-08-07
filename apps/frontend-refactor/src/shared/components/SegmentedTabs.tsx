import { Pressable, View } from 'react-native'
import { Text } from './Text'
import { cn } from '../utils/cn'

export interface SegmentedTabOption<T extends string> {
  label: string
  value: T
}

interface SegmentedTabsProps<T extends string> {
  options: SegmentedTabOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** Segmented control used as an inline filter. The selected segment is raised
 * with a cyan border/fill (see <TabButton /> for the same look as a button). */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <View className={cn('flex-row rounded-xl border border-line bg-surface/60 p-1', className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            className={cn(
              'flex-1 items-center rounded-lg px-3 py-2',
              selected && 'border border-primary/60 bg-primary/15',
            )}
          >
            <Text
              weight={selected ? 'semibold' : 'medium'}
              className={cn(
                'text-xs uppercase tracking-wide',
                selected ? 'text-primary' : 'text-content-muted',
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
