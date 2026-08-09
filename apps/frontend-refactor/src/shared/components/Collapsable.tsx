import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Animated, Pressable, View } from 'react-native'
import { Text } from './Text'
import { ChevronRight } from './icons'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'

interface CollapsableProps {
  title: string | ReactNode
  children: ReactNode
  defaultOpen?: boolean
  /** Controlled mode: when provided (with `onOpenChange`), the parent owns open/closed state
   * (e.g. to close the section programmatically after an action inside it). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

const ANIMATION_DURATION_MS = 180

/** "System window" section that expands/collapses its children when the title row is tapped. */
export function Collapsable({
  title,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
}: CollapsableProps) {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = isControlled ? open : internalOpen
  const rotation = useRef(new Animated.Value(isOpen ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isOpen ? 1 : 0,
      duration: ANIMATION_DURATION_MS,
      useNativeDriver: true,
    }).start()
  }, [isOpen])

  function toggle() {
    const next = !isOpen
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] })

  return (
    <View className={cn('overflow-hidden rounded-xl border border-line bg-surface/60', className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={toggle}
        className="flex-row items-center justify-between gap-3 px-4 py-3 active:opacity-80"
      >
        {typeof title === 'string' ? (
          <Text weight="semibold" className="flex-1 text-sm uppercase tracking-wide text-content">
            {title}
          </Text>
        ) : (
          title
        )}
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronRight size={18} color={colors.primary} />
        </Animated.View>
      </Pressable>
      {isOpen ? <View className="border-t border-line px-4 py-3">{children}</View> : null}
    </View>
  )
}
