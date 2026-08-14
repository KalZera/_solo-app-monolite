import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { Text } from './Text'
import { ChevronLeft } from './icons'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  right?: ReactNode
  onBack?: () => void
  className?: string
  /** Extra classes for the title (e.g. `uppercase`). */
  titleClassName?: string
}

export function ScreenHeader({
  title,
  subtitle,
  eyebrow,
  right,
  onBack,
  className,
  titleClassName,
}: ScreenHeaderProps) {
  return (
    <View className={cn('gap-1 pb-4 pt-2', className)}>
      <View className="min-h-6 flex-row items-center gap-2">
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" className="-ml-1">
            <ChevronLeft size={24} color={colors.content} />
          </Pressable>
        ) : null}
        {eyebrow ? (
          <Text weight="semibold" className="text-[11px] uppercase tracking-[4px] text-primary">
            {eyebrow}
          </Text>
        ) : null}
        <View className="flex-1" />
        {right}
      </View>
      <Text weight="bold" className={cn('text-3xl text-content', titleClassName)}>
        {title}
      </Text>
      {subtitle ? <Text className="text-sm text-content-muted">{subtitle}</Text> : null}
    </View>
  )
}
