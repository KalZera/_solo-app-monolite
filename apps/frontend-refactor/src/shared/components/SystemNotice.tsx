import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from './Text'
import { variantStyles } from './notice-variant'
import { cn } from '../utils/cn'
import type { NotificationVariant } from '../notifications/notification.store'

interface SystemNoticeProps {
  message: string
  title?: string
  variant?: NotificationVariant
  action?: ReactNode
  className?: string
}

/** Inline, persistent notification banner (as opposed to a transient toast). */
export function SystemNotice({
  message,
  title,
  variant = 'info',
  action,
  className,
}: SystemNoticeProps) {
  const style = variantStyles[variant]
  const Icon = style.Icon

  return (
    <View
      className={cn(
        'flex-row items-start gap-3 rounded-xl border bg-surface/60 p-3.5',
        style.border,
        className,
      )}
    >
      <Icon size={18} color={style.color} />
      <View className="flex-1">
        {title ? (
          <Text weight="semibold" className="text-sm text-content">
            {title}
          </Text>
        ) : null}
        <Text className={cn('text-xs text-content-muted', title && 'mt-0.5')}>{message}</Text>
      </View>
      {action}
    </View>
  )
}
