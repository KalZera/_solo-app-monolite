import { ScrollView, Text, XStack, YStack } from 'tamagui'
import { LoadingIndicator } from '@/shared/components/LoadingIndicator'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { useCharacterProfile } from '../api/useCharacterProfile'
import { StatRow } from '../components/StatRow'

export function CharacterScreen() {
  const { data: character, isPending, isError } = useCharacterProfile()

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} alignItems="center" padding="$5" paddingTop="$8" gap="$5">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          Status Window
        </Text>

        {isPending && <LoadingIndicator label="Summoning character data…" />}

        {isError && (
          <Text color="$soloDanger" paddingTop="$8">
            Failed to reach the System. Try again.
          </Text>
        )}

        {character && (
          <>
            <SystemPanel width="100%" maxWidth={420} gap="$4">
              <YStack alignItems="center" gap="$1">
                <Text color="$soloText" fontSize={28} fontWeight="800" textAlign="center">
                  {character.name}
                </Text>
                <Text color="$soloTextMuted" fontSize="$3" textAlign="center">
                  {character.title} · {character.class.toUpperCase()}
                </Text>
              </YStack>

              <XStack justifyContent="space-around" borderTopWidth={1} borderColor="$soloBorder" paddingTop="$4">
                <YStack alignItems="center" gap="$1">
                  <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                    Level
                  </Text>
                  <Text color="$soloCyan" fontSize="$7" fontWeight="800">
                    {character.level}
                  </Text>
                </YStack>
                <YStack alignItems="center" gap="$1">
                  <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                    Rank
                  </Text>
                  <Text color="$soloCyan" fontSize="$7" fontWeight="800">
                    {character.rank}
                  </Text>
                </YStack>
                <YStack alignItems="center" gap="$1">
                  <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                    Power
                  </Text>
                  <Text color="$soloCyan" fontSize="$7" fontWeight="800">
                    {character.powerScore}
                  </Text>
                </YStack>
              </XStack>

              <YStack gap="$1.5">
                <XStack justifyContent="space-between">
                  <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                    Experience
                  </Text>
                  <Text color="$soloTextMuted" fontSize="$2">
                    {character.experience} XP
                  </Text>
                </XStack>
              </YStack>
            </SystemPanel>

            <SystemPanel width="100%" maxWidth={420} gap="$4">
              <Text color="$soloText" fontSize="$5" fontWeight="700">
                Attributes
              </Text>
              <StatRow label="Strength" value={character.stats.strength} />
              <StatRow label="Intelligence" value={character.stats.intelligence} />
              <StatRow label="Agility" value={character.stats.agility} />
              <StatRow label="Vitality" value={character.stats.vitality} />
              <StatRow label="Luck" value={character.stats.luck} />
            </SystemPanel>
          </>
        )}
      </YStack>
    </ScrollView>
  )
}
