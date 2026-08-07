import { View } from 'react-native'
import { Text } from '@/shared/components'
import { cn } from '@/shared/utils/cn'

export interface CharacterInfoRow {
  label: string
  value: string
}

function InfoRow({ label, value, first }: CharacterInfoRow & { first: boolean }) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-3.5 py-2.5',
        !first && 'border-t border-line/60',
      )}
    >
      <Text className="text-xs text-content-muted">{label}</Text>
      <Text weight="medium" className="text-xs text-content">
        {value}
      </Text>
    </View>
  )
}

export function CharacterInfoPanel({ rows }: { rows: CharacterInfoRow[] }) {
  return (
    <View className="rounded-xl border border-line bg-black/15">
      {rows.map((row, index) => (
        <InfoRow key={row.label} label={row.label} value={row.value} first={index === 0} />
      ))}
    </View>
  )
}
