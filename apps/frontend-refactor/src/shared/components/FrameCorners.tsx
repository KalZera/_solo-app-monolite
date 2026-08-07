import { View } from 'react-native'
import { cn } from '../utils/cn'

/** Four L-shaped cyan corner accents. Render last so they sit above content. */
export function FrameCorners({ className }: { className?: string }) {
  const base = cn('absolute h-3.5 w-3.5 border-primary', className)
  return (
    <>
      <View className={cn(base, 'left-1 top-1 border-l-2 border-t-2')} />
      <View className={cn(base, 'right-1 top-1 border-r-2 border-t-2')} />
      <View className={cn(base, 'bottom-1 left-1 border-b-2 border-l-2')} />
      <View className={cn(base, 'bottom-1 right-1 border-b-2 border-r-2')} />
    </>
  )
}
