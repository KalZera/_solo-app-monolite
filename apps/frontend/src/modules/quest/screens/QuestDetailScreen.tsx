import { useState } from 'react'
import { useRouter } from 'expo-router'
import { ChevronLeft } from '@tamagui/lucide-icons-2'
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui'
import { LoadingIndicator } from '@/shared/components/LoadingIndicator'
import { SystemButton } from '@/shared/components/SystemButton'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { LevelUpDialog } from '@/modules/character/components/LevelUpDialog'
import { useCompleteQuest } from '../api/useCompleteQuest'
import { useQuest } from '../api/useQuest'

interface QuestDetailScreenProps {
  questId: string
}

interface LevelUpInfo {
  newLevel: number
  powerScore: number
  levelsGained: number
}

const INACTIVE_STATUSES = ['completed', 'failed', 'expired']

export function QuestDetailScreen({ questId }: QuestDetailScreenProps) {
  const router = useRouter()
  const { data: quest, isPending, isError } = useQuest(questId)
  const completeQuest = useCompleteQuest()
  const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | null>(null)

  const canComplete = quest ? !INACTIVE_STATUSES.includes(quest.status) : false

  function handleComplete() {
    if (!quest) return
    completeQuest.mutate(quest.id, {
      onSuccess: (result) => {
        if (result.levelsGained.length > 0) {
          setLevelUpInfo({
            newLevel: result.character.level,
            powerScore: result.character.powerScore,
            levelsGained: result.levelsGained.length,
          })
        }
      },
    })
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} padding="$4" paddingTop="$7" gap="$4">
        <XStack alignItems="center" gap="$3">
          <Button
            chromeless
            circular
            size="$3"
            icon={<ChevronLeft color="$soloText" size={22} />}
            onPress={() => router.back()}
          />
          <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
            Quest Details
          </Text>
        </XStack>

        {isPending && <LoadingIndicator label="Loading quest…" />}

        {isError && (
          <Text color="$soloDanger" textAlign="center">
            Failed to reach the System. Try again.
          </Text>
        )}

        {quest && (
          <SystemPanel gap="$4">
            <YStack gap="$1">
              <Text color="$soloText" fontSize={22} fontWeight="800">
                {quest.title}
              </Text>
              <Text color="$soloTextMuted" fontSize="$3">
                {quest.description}
              </Text>
            </YStack>

            <XStack flexWrap="wrap" gap="$5">
              <YStack gap="$1">
                <Text color="$soloTextMuted" fontSize="$1" textTransform="uppercase">
                  Rank
                </Text>
                <Text color="$soloPurpleGlow" fontWeight="700">
                  {quest.questRank}
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text color="$soloTextMuted" fontSize="$1" textTransform="uppercase">
                  Type
                </Text>
                <Text color="$soloText" fontWeight="700" textTransform="capitalize">
                  {quest.type}
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text color="$soloTextMuted" fontSize="$1" textTransform="uppercase">
                  Status
                </Text>
                <Text color="$soloText" fontWeight="700" textTransform="capitalize">
                  {quest.status.replace('_', ' ')}
                </Text>
              </YStack>
              <YStack gap="$1">
                <Text color="$soloTextMuted" fontSize="$1" textTransform="uppercase">
                  Reward
                </Text>
                <Text color="$soloCyan" fontWeight="700">
                  {quest.rewardXp} XP
                </Text>
              </YStack>
            </XStack>

            {quest.expiresAt && (
              <Text color="$soloTextMuted" fontSize="$2">
                Deadline: {new Date(quest.expiresAt).toLocaleString()}
              </Text>
            )}

            {completeQuest.isError && (
              <Text color="$soloDanger" fontSize="$2">
                Unable to complete this quest. Try again.
              </Text>
            )}

            {canComplete ? (
              <SystemButton onPress={handleComplete} disabled={completeQuest.isPending}>
                {completeQuest.isPending ? 'Completing…' : 'Complete Quest'}
              </SystemButton>
            ) : (
              <Text color="$soloTextMuted" textAlign="center" fontSize="$2" textTransform="uppercase">
                Quest {quest.status.replace('_', ' ')}
              </Text>
            )}
          </SystemPanel>
        )}
      </YStack>

      {levelUpInfo && (
        <LevelUpDialog
          open={levelUpInfo !== null}
          onOpenChange={(open) => {
            if (!open) setLevelUpInfo(null)
          }}
          newLevel={levelUpInfo.newLevel}
          powerScore={levelUpInfo.powerScore}
          levelsGained={levelUpInfo.levelsGained}
        />
      )}
    </ScrollView>
  )
}
