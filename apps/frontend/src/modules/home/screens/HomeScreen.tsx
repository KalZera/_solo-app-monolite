import { Bell, Menu } from '@tamagui/lucide-icons-2'
import { ScrollView, XStack, YStack } from 'tamagui'
import { useCharacterProfile } from '@/modules/character/api/useCharacterProfile'
import { useDailyQuests } from '@/modules/quest/api/useDailyQuests'
import { LoadingIndicator } from '@/shared/components/LoadingIndicator'
import { AttributesPanel } from '../components/AttributesPanel'
import { DailyMissionsPanel } from '../components/DailyMissionsPanel'
import { HeroCard } from '../components/HeroCard'

// Mock until attribute-point allocation ships server-side.
const MOCK_AVAILABLE_ATTRIBUTE_POINTS = 5

export function HomeScreen() {
  const { data: character, isPending: isCharacterPending } = useCharacterProfile()
  const { data: quests, isPending: isQuestsPending } = useDailyQuests()

  if (isCharacterPending || isQuestsPending) {
    return <LoadingIndicator label="Summoning the System…" />
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} padding="$4" paddingTop="$7" gap="$4">
        <XStack width="100%" justifyContent="space-between" alignItems="center">
          <Menu color="$soloText" size={24} />
          <YStack>
            <Bell color="$soloText" size={24} />
            <YStack
              position="absolute"
              top={-2}
              right={-2}
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor="$soloDanger"
            />
          </YStack>
        </XStack>

        {character && <HeroCard character={character} />}
        {character && (
          <AttributesPanel stats={character.stats} availablePoints={MOCK_AVAILABLE_ATTRIBUTE_POINTS} />
        )}
        {quests && <DailyMissionsPanel quests={quests} />}
      </YStack>
    </ScrollView>
  )
}
