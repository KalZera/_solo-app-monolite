import { ScrollView, Text, YStack } from 'tamagui'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { useCharacterProfile } from '@/modules/character/api/useCharacterProfile'

export function HomeScreen() {
  const { data: character } = useCharacterProfile()

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} alignItems="center" padding="$5" paddingTop="$8" gap="$5">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          The System
        </Text>

        <SystemPanel width="100%" maxWidth={420} gap="$2">
          <Text color="$soloText" fontSize={24} fontWeight="800">
            Welcome back{character ? `, ${character.name}` : ''}
          </Text>
          <Text color="$soloTextMuted" fontSize="$3">
            {character
              ? `Level ${character.level} · ${character.title}`
              : 'Loading your hunter data…'}
          </Text>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
