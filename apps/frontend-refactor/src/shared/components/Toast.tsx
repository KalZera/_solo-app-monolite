import { Pressable, View } from 'react-native'
import { Text } from './Text'
import { X } from './icons'
import { variantStyles } from './notice-variant'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'
import type { Toast as ToastData } from '../notifications/notification.store'

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const style = variantStyles[toast.variant]
  const Icon = style.Icon

  return (
    <View
      className={cn(
        'flex-row items-start gap-3 rounded-xl border bg-surface-raised p-3.5 shadow-lg',
        style.border,
      )}
    >
      <Icon size={20} color={style.color} />
      <View className="flex-1">
        <Text weight="semibold" className="text-sm text-content">
          {toast.title}
        </Text>
        {toast.message ? (
          <Text className="mt-0.5 text-xs text-content-muted">{toast.message}</Text>
        ) : null}
      </View>
      <Pressable onPress={() => onDismiss(toast.id)} hitSlop={8} accessibilityRole="button">
        <X size={16} color={colors.contentMuted} />
      </Pressable>
    </View>
  )
}
