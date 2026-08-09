import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from '@/shared/components'
import { cn } from '../utils/cn'

const RADAR_ORDER = ['strength', 'agility', 'vitality', 'intelligence', 'luck'] as const

interface SectionProps {
  title: string
  children: ReactNode
  className?: string
  icon?: ReactNode
}

export function Section({ title, children, className, icon }: SectionProps) {
  return (
    <View className="gap-2">
      <View className="flex flex-row items-center gap-2 pl-2">
        {!!icon ? icon : null}
        <Text className={cn('text-[11px] uppercase tracking-[2px] text-primary', className)}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  )
}
