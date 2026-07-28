import { Plus } from '@tamagui/lucide-icons-2'
import { Button, Text, XStack, YStack } from 'tamagui'
import { ProgressBar } from '@/shared/components/ProgressBar'

const ATTRIBUTE_BAR_MAX = 500

interface AttributeRowProps {
  icon: React.ComponentType<{ color?: string; size?: number }>
  label: string
  value: number
  canAllocate?: boolean
  isAllocating?: boolean
  onAllocate?: () => void
}

export function AttributeRow({
  icon: Icon,
  label,
  value,
  canAllocate = false,
  isAllocating = false,
  onAllocate,
}: AttributeRowProps) {
  return (
    <XStack alignItems="center" gap="$3">
      <YStack
        width={32}
        height={32}
        borderRadius={16}
        backgroundColor="$soloPanelAlt"
        alignItems="center"
        justifyContent="center"
      >
        <Icon color="$soloPurpleGlow" size={16} />
      </YStack>

      <YStack flex={1} gap="$1.5">
        <Text color="$soloTextMuted" fontSize="$3">
          {label}
        </Text>
        <ProgressBar value={value} max={ATTRIBUTE_BAR_MAX} color="$soloPurple" />
      </YStack>

      <Text color="$soloText" fontSize="$4" fontWeight="700" minWidth={32} textAlign="right">
        {value}
      </Text>

      <Button
        size="$2"
        circular
        chromeless
        borderWidth={1}
        borderColor={canAllocate ? '$soloCyan' : '$soloBorderStrong'}
        backgroundColor="$soloPanelAlt"
        opacity={canAllocate ? 1 : 0.4}
        disabled={!canAllocate || isAllocating}
        icon={<Plus color="$soloPurpleGlow" size={14} />}
        onPress={onAllocate}
      />
    </XStack>
  )
}
