import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from './Text'
import { cn } from '../utils/cn'

interface EmptyStateProps {
  title: string
  message?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, message, icon, action, className }: EmptyStateProps) {
  return (
    <View className={cn('items-center justify-center gap-3 py-16', className)}>
      {icon}
      <Text weight="semibold" className="text-center text-base text-content">
        {title}
      </Text>
      {message ? (
        <Text className="max-w-xs text-center text-sm text-content-muted">{message}</Text>
      ) : null}
      {action}
    </View>
  )
}
