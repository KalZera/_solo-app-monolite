import { ActivityIndicator, View } from 'react-native'
import { Text } from './Text'
import { GradientBackground } from './GradientBackground'
import { cn } from '../utils/cn'
import { colors } from '../theme/colors'

interface LoadingProps {
  label?: string
  className?: string
}

/** Inline centered spinner with an optional label. */
export function Loading({ label, className }: LoadingProps) {
  return (
    <View className={cn('items-center justify-center gap-3 py-10', className)}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Text className="text-sm text-content-muted">{label}</Text> : null}
    </View>
  )
}

/** Full-screen loading state over the app gradient (used while booting). */
export function FullScreenLoading({ label }: LoadingProps) {
  return (
    <GradientBackground>
      <View className="flex-1 items-center justify-center">
        <Loading label={label} />
      </View>
    </GradientBackground>
  )
}
