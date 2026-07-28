import { useTranslation } from 'react-i18next'
import { ScrollView, Text, YStack } from 'tamagui'
import { SystemPanel } from '@/shared/components/SystemPanel'

export function InventoryScreen() {
  const { t } = useTranslation()

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} alignItems="center" padding="$5" paddingTop="$8" gap="$5">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          {t('inventory.title')}
        </Text>

        <SystemPanel width="100%" maxWidth={420}>
          <Text color="$soloTextMuted" fontSize="$3" textAlign="center">
            {t('inventory.empty')}
          </Text>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
