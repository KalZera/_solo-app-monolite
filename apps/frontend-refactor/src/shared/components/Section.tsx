import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from '@/shared/components'
import { cn } from '../utils/cn'

interface SectionProps {
  title: string
  children: ReactNode
  className?: string
  icon?: ReactNode
  /** Optional element pinned to the right of the title row (e.g. an edit button). */
  action?: ReactNode
}

export function Section({ title, children, className, icon, action }: SectionProps) {
  return (
    <View className="gap-2">
      <View className="flex flex-row items-center gap-2 pl-2">
        {!!icon ? icon : null}
        <Text className={cn('text-[11px] uppercase tracking-[2px] text-primary', className)}>
          {title}
        </Text>
        {action ? <View className="ml-auto">{action}</View> : null}
      </View>
      {children}
    </View>
  )
}
