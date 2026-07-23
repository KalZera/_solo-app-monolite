import { Spinner, Text, YStack } from 'tamagui'

interface LoadingIndicatorProps {
  label?: string
}

export function LoadingIndicator({ label = 'Loading…' }: LoadingIndicatorProps) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$3" paddingVertical="$8">
      <Spinner size="large" color="$soloPurple" />
      {label ? (
        <Text color="$soloTextMuted" fontSize="$3">
          {label}
        </Text>
      ) : null}
    </YStack>
  )
}
