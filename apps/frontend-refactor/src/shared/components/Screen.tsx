import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { GradientBackground } from './GradientBackground'
import { cn } from '../utils/cn'

interface ScreenProps {
  children: ReactNode
  scroll?: boolean
  /** Centers content vertically and horizontally (used by auth screens). */
  center?: boolean
  className?: string
  contentClassName?: string
  edges?: readonly Edge[]
}

/**
 * Screen shell: full-bleed gradient + safe-area padding. Handles the common
 * scroll/centered layouts so screens only render their content.
 */
export function Screen({
  children,
  scroll = false,
  center = false,
  className,
  contentClassName,
  edges = ['top', 'left', 'right'],
}: ScreenProps) {
  const padding = 'px-5 pb-6'

  return (
    <GradientBackground>
      <SafeAreaView edges={edges} className={cn('flex-1', className)}>
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName={cn(padding, 'pt-2 grow', contentClassName)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View
            className={cn('flex-1', padding, 'pt-2', center && 'justify-center', contentClassName)}
          >
            {children}
          </View>
        )}
      </SafeAreaView>
    </GradientBackground>
  )
}
