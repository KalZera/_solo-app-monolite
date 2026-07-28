import { Brain, Clover, Dumbbell, Footprints, Heart } from '@tamagui/lucide-icons-2'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'
import type { AllocatableAttribute, CharacterStats } from '@/modules/character/types'
import { useAllocateAttributePoint } from '@/modules/character/api/useAllocateAttributePoint'
import { AttributeRow } from './AttributeRow'

interface AttributesPanelProps {
  stats: CharacterStats
  availablePoints?: number
}

const ATTRIBUTE_ROWS: { key: AllocatableAttribute; icon: typeof Dumbbell; labelKey: string }[] = [
  { key: 'strength', icon: Dumbbell, labelKey: 'character.screen.stats.strength' },
  { key: 'agility', icon: Footprints, labelKey: 'character.screen.stats.agility' },
  { key: 'vitality', icon: Heart, labelKey: 'character.screen.stats.vitality' },
  { key: 'intelligence', icon: Brain, labelKey: 'character.screen.stats.intelligence' },
  { key: 'luck', icon: Clover, labelKey: 'character.screen.stats.luck' },
]

export function AttributesPanel({ stats, availablePoints = 0 }: AttributesPanelProps) {
  const { t } = useTranslation()
  const allocateAttributePoint = useAllocateAttributePoint()

  return (
    <YStack
      width="100%"
      backgroundColor="$soloPanel"
      borderColor="$soloBorder"
      borderWidth={1}
      borderRadius="$6"
      padding="$4"
      gap="$4"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text color="$soloTextMuted" fontSize="$2" letterSpacing={2} textTransform="uppercase" fontWeight="700">
          {t('home.attributes')}
        </Text>
        {availablePoints > 0 && (
          <XStack alignItems="center" gap="$2">
            <YStack
              width={22}
              height={22}
              borderRadius={11}
              backgroundColor="$soloPurple"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="$soloBg" fontSize="$1" fontWeight="800">
                {availablePoints}
              </Text>
            </YStack>
            <Text color="$soloTextMuted" fontSize="$2">
              {t('home.pointsAvailable')}
            </Text>
          </XStack>
        )}
      </XStack>

      <YStack gap="$3">
        {ATTRIBUTE_ROWS.map((row) => (
          <AttributeRow
            key={row.key}
            icon={row.icon}
            label={t(row.labelKey)}
            value={stats[row.key]}
            canAllocate={availablePoints > 0}
            isAllocating={allocateAttributePoint.isPending}
            onAllocate={() => allocateAttributePoint.mutate({ attribute: row.key, amount: 1 })}
          />
        ))}
      </YStack>
    </YStack>
  )
}
