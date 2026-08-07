import { View } from 'react-native'
import { cn } from '../utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  tone?: 'primary' | 'success' | 'legendary'
  className?: string
}

const fillClass = {
  primary: 'bg-primary',
  success: 'bg-success',
  legendary: 'bg-legendary',
} as const

export function ProgressBar({ value, max = 100, tone = 'primary', className }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <View className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-raised', className)}>
      <View className={cn('h-full rounded-full', fillClass[tone])} style={{ width: `${pct}%` }} />
    </View>
  )
}
