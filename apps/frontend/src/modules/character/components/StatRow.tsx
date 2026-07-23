import { Text, XStack, YStack } from 'tamagui'

const STAT_BAR_MAX = 500

interface StatRowProps {
  label: string
  value: number
}

export function StatRow({ label, value }: StatRowProps) {
  const fillPercent = Math.min(value / STAT_BAR_MAX, 1) * 100

  return (
    <YStack gap="$1.5">
      <XStack justifyContent="space-between">
        <Text color="$soloTextMuted" fontSize="$3" letterSpacing={1} textTransform="uppercase">
          {label}
        </Text>
        <Text color="$soloText" fontSize="$3" fontWeight="700">
          {value}
        </Text>
      </XStack>
      <YStack height={6} borderRadius="$10" backgroundColor="$soloPanelAlt" overflow="hidden">
        <YStack height="100%" width={`${fillPercent}%`} backgroundColor="$soloBlue" borderRadius="$10" />
      </YStack>
    </YStack>
  )
}
