import type { ReactNode } from 'react'
import { Pressable, type PressableProps } from 'react-native'
import { Text } from './Text'
import { cn } from '../utils/cn'

interface TabButtonProps extends Omit<PressableProps, 'children'> {
  label: string
  icon?: ReactNode
  className?: string
}

/** Button that reuses the exact look of the selected <SegmentedTabs /> segment. */
export function TabButton({ label, icon, className, ...props }: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'flex-row items-center gap-2 self-start rounded-lg border border-primary/60 bg-primary/15 px-4 py-2 active:bg-primary/25',
        className,
      )}
      {...props}
    >
      {icon}
      <Text weight="semibold" className="text-xs uppercase tracking-wide text-primary">
        {label}
      </Text>
    </Pressable>
  )
}
