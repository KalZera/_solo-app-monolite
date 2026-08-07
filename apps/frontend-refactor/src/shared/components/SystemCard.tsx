import type { ReactNode } from 'react'
import { View } from 'react-native'
import { cn } from '../utils/cn'

/** L-shaped cyan accents at each corner — the Solo Leveling "System window" look. */
function Corners() {
  const base = 'absolute h-3.5 w-3.5 border-primary'
  return (
    <>
      <View className={`${base} left-1 top-1 border-l-2 border-t-2`} />
      <View className={`${base} right-1 top-1 border-r-2 border-t-2`} />
      <View className={`${base} bottom-1 left-1 border-b-2 border-l-2`} />
      <View className={`${base} bottom-1 right-1 border-b-2 border-r-2`} />
    </>
  )
}

interface SystemCardProps {
  children: ReactNode
  className?: string
}

/** Bordered surface panel framed with corner brackets. */
export function SystemCard({ children, className }: SystemCardProps) {
  return (
    <View className={cn('relative rounded-2xl border border-line bg-surface/50 p-4', className)}>
      <Corners />
      {children}
    </View>
  )
}
