import { useRouter } from 'expo-router'
import { Text, XStack, YStack } from 'tamagui'
import type { Quest, QuestStatus } from '../types'

const STATUS_COLORS: Record<QuestStatus, string> = {
  available: '$soloTextMuted',
  in_progress: '$soloPurpleGlow',
  completed: '$soloSuccess',
  failed: '$soloDanger',
  expired: '$soloDanger',
}

interface QuestCardProps {
  quest: Quest
}

export function QuestCard({ quest }: QuestCardProps) {
  const router = useRouter()

  return (
    <YStack
      onPress={() => router.push(`/quests/${quest.id}`)}
      backgroundColor="$soloPanel"
      borderColor="$soloBorder"
      borderWidth={1}
      borderRadius="$5"
      padding="$4"
      gap="$2"
      pressStyle={{ borderColor: '$soloBorderStrong' }}
      cursor="pointer"
    >
      <Text color="$soloText" fontSize="$4" fontWeight="700">
        {quest.title}
      </Text>
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$3">
          <Text color="$soloPurpleGlow" fontSize="$2" fontWeight="700" textTransform="uppercase">
            Rank {quest.questRank}
          </Text>
          <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
            {quest.type}
          </Text>
        </XStack>
        <Text color={STATUS_COLORS[quest.status]} fontSize="$2" fontWeight="700" textTransform="uppercase">
          {quest.status.replace('_', ' ')}
        </Text>
      </XStack>
    </YStack>
  )
}
