import type { ReactNode } from 'react'
import { View } from 'react-native'
import { cn } from '@/shared/utils/cn'

interface SquareBoxProps {
  children: ReactNode
  className?: string
}

export function SquareBox({ children, className }: SquareBoxProps) {
  return (
    <View className="flex flex-row gap-2 flex-1">
      <View
        className={cn(
          'flex-1 rounded-lg px-3 py-2 border border-primary/60 bg-surface justify-start items-center',
          className,
        )}
      >
        {children}
      </View>
    </View>
  )
}
