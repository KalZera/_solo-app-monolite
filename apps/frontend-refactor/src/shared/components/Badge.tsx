import { View } from 'react-native'
import { Text } from './Text'
import { cn } from '../utils/cn'

export type BadgeTone =
  'primary' | 'success' | 'warning' | 'danger' | 'epic' | 'legendary' | 'muted'

const containerClass: Record<BadgeTone, string> = {
  primary: 'bg-primary/15',
  success: 'bg-success/15',
  warning: 'bg-warning/15',
  danger: 'bg-danger/15',
  epic: 'bg-epic/15',
  legendary: 'bg-legendary/15',
  muted: 'bg-content-muted/15',
}

const textClass: Record<BadgeTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  epic: 'text-epic',
  legendary: 'text-legendary',
  muted: 'text-content-muted',
}

interface BadgeProps {
  label: string
  tone?: BadgeTone
  className?: string
}

export function Badge({ label, tone = 'primary', className }: BadgeProps) {
  return (
    <View className={cn('self-start rounded-md px-2 py-0.5', containerClass[tone], className)}>
      <Text
        weight="semibold"
        className={cn('text-[11px] uppercase tracking-wider', textClass[tone])}
      >
        {label}
      </Text>
    </View>
  )
}
