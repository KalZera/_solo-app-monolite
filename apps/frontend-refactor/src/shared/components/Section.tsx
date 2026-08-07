import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Text } from '@/shared/components'

const RADAR_ORDER = ['strength', 'agility', 'vitality', 'intelligence', 'luck'] as const

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-[11px] uppercase tracking-[2px] text-primary">{title}</Text>
      {children}
    </View>
  )
}
