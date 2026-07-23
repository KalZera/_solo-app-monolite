import { Brain, Clover, Dumbbell, Footprints, Heart } from '@tamagui/lucide-icons-2'
import { Text, XStack, YStack } from 'tamagui'
import type { CharacterStats } from '@/modules/character/types'
import { AttributeRow } from './AttributeRow'

interface AttributesPanelProps {
  stats: CharacterStats
  availablePoints?: number
}

export function AttributesPanel({ stats, availablePoints = 0 }: AttributesPanelProps) {
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
          Attributes
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
              Points available
            </Text>
          </XStack>
        )}
      </XStack>

      <YStack gap="$3">
        <AttributeRow icon={Dumbbell} label="Strength" value={stats.strength} />
        <AttributeRow icon={Footprints} label="Agility" value={stats.agility} />
        <AttributeRow icon={Heart} label="Vitality" value={stats.vitality} />
        <AttributeRow icon={Brain} label="Intelligence" value={stats.intelligence} />
        <AttributeRow icon={Clover} label="Luck" value={stats.luck} />
      </YStack>
    </YStack>
  )
}
