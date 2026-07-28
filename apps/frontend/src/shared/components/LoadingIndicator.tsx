import { useTranslation } from 'react-i18next'
import { Spinner, Text, YStack } from 'tamagui'

interface LoadingIndicatorProps {
  label?: string
}

export function LoadingIndicator({ label }: LoadingIndicatorProps) {
  const { t } = useTranslation()
  const resolvedLabel = label ?? t('common.loading')

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$3" paddingVertical="$8">
      <Spinner size="large" color="$soloPurple" />
      {resolvedLabel ? (
        <Text color="$soloTextMuted" fontSize="$3">
          {resolvedLabel}
        </Text>
      ) : null}
    </YStack>
  )
}
