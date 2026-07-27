import { useState } from 'react'
import { useRouter } from 'expo-router'
import { ChevronLeft } from '@tamagui/lucide-icons-2'
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { SystemInput } from '@/shared/components/SystemInput'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useCreateQuest } from '../api/useCreateQuest'
import type { CreatableQuestType } from '../types'

const QUEST_TYPE_OPTIONS: { label: string; value: CreatableQuestType }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Main', value: 'main' },
]

export function CreateQuestScreen() {
  const router = useRouter()
  const createQuest = useCreateQuest()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questRank, setQuestRank] = useState('')
  const [type, setType] = useState<CreatableQuestType>('daily')
  const [rewardXp, setRewardXp] = useState('')

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    questRank.trim().length > 0 &&
    Number(rewardXp) > 0 &&
    !createQuest.isPending

  function handleSubmit() {
    if (!canSubmit) return

    createQuest.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        questRank: questRank.trim(),
        type,
        rewardXp: Number(rewardXp),
      },
      { onSuccess: () => router.back() },
    )
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
            New Quest
          </Text>
        </XStack>

        <SystemPanel gap="$4">
          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              Title
            </Text>
            <SystemInput value={title} onChangeText={setTitle} placeholder="Train for 30 minutes" />
          </YStack>

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              Description
            </Text>
            <SystemInput value={description} onChangeText={setDescription} placeholder="Spend 30 minutes training" />
          </YStack>

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              Rank
            </Text>
            <SystemInput
              value={questRank}
              onChangeText={setQuestRank}
              placeholder="E, D, C, B, A, S"
              autoCapitalize="characters"
            />
          </YStack>

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              Type
            </Text>
            <XStack gap="$2">
              {QUEST_TYPE_OPTIONS.map((option) => (
                <SystemButton
                  key={option.value}
                  flex={1}
                  backgroundColor={type === option.value ? '$soloBlue' : '$soloPanelAlt'}
                  onPress={() => setType(option.value)}
                >
                  {option.label}
                </SystemButton>
              ))}
            </XStack>
          </YStack>

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              XP Reward
            </Text>
            <SystemInput value={rewardXp} onChangeText={setRewardXp} placeholder="10" keyboardType="numeric" />
          </YStack>

          {createQuest.isError && (
            <Text color="$soloDanger" fontSize="$2">
              {getErrorMessage(createQuest.error)}
            </Text>
          )}

          <SystemButton onPress={handleSubmit} disabled={!canSubmit}>
            {createQuest.isPending ? 'Creating…' : 'Create Quest'}
          </SystemButton>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
