import type { ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { cn } from '../utils/cn'

interface PanelProps extends ViewProps {
  children: ReactNode
  className?: string
}

/** A "System window" surface card: subtle cyan border over the base surface. */
export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <View className={cn('rounded-2xl border border-line bg-surface p-5', className)} {...props}>
      {children}
    </View>
  )
}
