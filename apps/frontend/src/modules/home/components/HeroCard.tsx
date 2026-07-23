import { User } from '@tamagui/lucide-icons-2'
import { Text, XStack, YStack } from 'tamagui'
import { ProgressBar } from '@/shared/components/ProgressBar'
import type { CharacterProfile } from '@/modules/character/types'

// Placeholder pacing until a real leveling formula ships server-side.
const XP_PER_LEVEL = 1400

interface HeroCardProps {
  character: CharacterProfile
}

export function HeroCard({ character }: HeroCardProps) {
  const xpIntoLevel = character.experience % XP_PER_LEVEL

  return (
    <XStack
      width="100%"
      backgroundColor="$soloPanel"
      borderColor="$soloBorder"
      borderWidth={1}
      borderRadius="$6"
      padding="$4"
      gap="$4"
      alignItems="flex-start"
    >
      <YStack
        width={64}
        height={64}
        borderRadius={32}
        backgroundColor="$soloBgElevated"
        borderColor="$soloPurple"
        borderWidth={2}
        alignItems="center"
        justifyContent="center"
      >
        <User color="$soloTextMuted" size={30} />
      </YStack>

      <YStack flex={1} gap="$2">
        <Text color="$soloText" fontSize={20} fontWeight="800">
          {character.name}
        </Text>
        <Text color="$soloPurpleGlow" fontSize="$3" fontWeight="700">
          Rank {character.rank}
        </Text>
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$soloText" fontSize="$3">
            Level {character.level}
          </Text>
          <Text color="$soloTextMuted" fontSize="$2">
            {xpIntoLevel} / {XP_PER_LEVEL} XP
          </Text>
        </XStack>
        <ProgressBar value={xpIntoLevel} max={XP_PER_LEVEL} color="$soloPurple" />
      </YStack>
    </XStack>
  )
}
