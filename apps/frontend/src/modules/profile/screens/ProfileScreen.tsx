import { useState } from 'react'
import { useRouter } from 'expo-router'
import { ScrollView, Text, YStack } from 'tamagui'
import { useSession } from '@/modules/auth/session/SessionProvider'
import { useCharacterProfile } from '@/modules/character/api/useCharacterProfile'
import { SystemButton } from '@/shared/components/SystemButton'
import { SystemPanel } from '@/shared/components/SystemPanel'

export function ProfileScreen() {
  const router = useRouter()
  const { signOut } = useSession()
  const { data: character } = useCharacterProfile()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleLogOff() {
    setIsSigningOut(true)
    await signOut()
    router.replace('/login')
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$soloBg">
      <YStack flex={1} alignItems="center" padding="$5" paddingTop="$8" gap="$5">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          Hunter Profile
        </Text>

        <SystemPanel width="100%" maxWidth={420} gap="$4">
          <YStack alignItems="center" gap="$1">
            <Text color="$soloText" fontSize={24} fontWeight="800">
              {character?.name ?? 'Hunter'}
            </Text>
            <Text color="$soloTextMuted" fontSize="$3">
              {character ? `${character.title} · Rank ${character.rank}` : ' '}
            </Text>
          </YStack>

          <SystemButton onPress={handleLogOff} disabled={isSigningOut}>
            {isSigningOut ? 'Logging off…' : 'Log Off'}
          </SystemButton>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
