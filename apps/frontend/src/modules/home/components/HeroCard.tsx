import { User } from '@tamagui/lucide-icons-2'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'
import { ProgressBar } from '@/shared/components/ProgressBar'
import type { CharacterProfile } from '@/modules/character/types'
import { useCharacterProgress } from '@/modules/progression'

interface HeroCardProps {
  character: CharacterProfile
}

export function HeroCard({ character }: HeroCardProps) {
  const { t } = useTranslation()
  // Level, XP-into-level and the bar all come from the shared ProgressionEngine,
  // driven purely by the character's accumulated XP.
  const progress = useCharacterProgress(character.experience)
  const xpIntoLevel = progress.xpIntoCurrentLevel
  const levelSpan = progress.xpIntoCurrentLevel + progress.xpRemaining

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
          {t('character.screen.rank')} {character.rank}
        </Text>
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$soloText" fontSize="$3">
            {t('character.screen.level')} {progress.level}
          </Text>
          <Text color="$soloTextMuted" fontSize="$2">
            {xpIntoLevel} / {levelSpan} XP
          </Text>
        </XStack>
        <ProgressBar value={xpIntoLevel} max={levelSpan} color="$soloPurple" />
      </YStack>
    </XStack>
  )
}
