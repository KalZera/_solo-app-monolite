import { useRouter } from 'expo-router'
import { Plus } from '@tamagui/lucide-icons-2'
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui'
import { LoadingIndicator } from '@/shared/components/LoadingIndicator'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { useQuests } from '../api/useQuests'
import { QuestCard } from '../components/QuestCard'

export function QuestListScreen() {
  const router = useRouter()
  const { data: quests, isPending, isError } = useQuests()

  return (
    <YStack flex={1} backgroundColor="$soloBg">
      <XStack width="100%" justifyContent="space-between" alignItems="center" padding="$4" paddingTop="$7">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          Quest Log
        </Text>
        <Button
          circular
          size="$3"
          backgroundColor="$soloBlue"
          icon={<Plus color="$soloBg" size={18} />}
          onPress={() => router.push('/quests/new')}
        />
      </XStack>

      {isPending && <LoadingIndicator label="Loading quests…" />}

      {isError && (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$5">
          <Text color="$soloDanger">Failed to reach the System. Try again.</Text>
        </YStack>
      )}

      {quests && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <YStack gap="$3">
            {quests.length === 0 && (
              <SystemPanel>
                <Text color="$soloTextMuted" textAlign="center">
                  No quests yet. Tap + to create your first one.
                </Text>
              </SystemPanel>
            )}
            {quests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  )
}
