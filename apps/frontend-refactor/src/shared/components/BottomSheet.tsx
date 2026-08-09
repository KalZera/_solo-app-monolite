import type { ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from './Text'
import { FrameCorners } from './FrameCorners'
import { variantStyles } from './notice-variant'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'
import type { NotificationVariant } from '../notifications/notification.store'

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  message?: string
  variant?: NotificationVariant
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  confirmLoading?: boolean
  children?: ReactNode
}

/**
 * "System window" sheet that slides up from the bottom of the screen — the shared shell for
 * confirmations (e.g. "delete this quest?"). Tapping the backdrop or Cancel calls `onClose`;
 * pass `onConfirm` to render the confirm/cancel action row, or just `children` for anything else.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  message,
  variant = 'info',
  confirmLabel,
  cancelLabel,
  onConfirm,
  confirmLoading = false,
  children,
}: BottomSheetProps) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const style = variantStyles[variant]
  const Icon = style.Icon

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} className="flex-1 justify-end bg-black/75">
        <Pressable
          onPress={() => undefined}
          className="overflow-hidden rounded-t-2xl border-l border-r border-t border-primary/50"
          style={{
            shadowColor: colors.primary,
            shadowOpacity: 0.5,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -4 },
            elevation: 12,
          }}
        >
          <LinearGradient
            colors={['#16323F', '#0F2634', '#0B1720']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <FrameCorners />

          <View className="items-center pt-2.5">
            <View className="h-1 w-10 rounded-full bg-primary/40" />
          </View>

          <View className="gap-4 p-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            {title || message ? (
              <View className="flex-row items-start gap-3">
                <Icon size={20} color={style.color} />
                <View className="flex-1 gap-1">
                  {title ? (
                    <Text
                      weight="bold"
                      className="text-base uppercase tracking-[2px] text-content"
                    >
                      {title}
                    </Text>
                  ) : null}
                  {message ? (
                    <Text className="text-sm text-content-muted">{message}</Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {children}

            {onConfirm ? (
              <View className="flex-row gap-3 pt-1">
                <Pressable
                  accessibilityRole="button"
                  onPress={onClose}
                  className="flex-1 items-center rounded-lg border border-line py-3 active:bg-surface-raised"
                >
                  <Text
                    weight="semibold"
                    className="text-sm uppercase tracking-[2px] text-content-muted"
                  >
                    {cancelLabel ?? t('common.cancel')}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={confirmLoading}
                  onPress={onConfirm}
                  className={cn(
                    'flex-1 items-center rounded-lg border border-primary/60 bg-primary/10 py-3 active:bg-primary/20',
                    confirmLoading && 'opacity-50',
                  )}
                >
                  <Text
                    weight="semibold"
                    className="text-sm uppercase tracking-[2px] text-primary-hover"
                  >
                    {confirmLoading ? t('common.loading') : confirmLabel ?? t('common.confirm')}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
