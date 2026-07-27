import { useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { SystemInput } from '@/shared/components/SystemInput'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useCreateCharacter } from '../api/useCreateCharacter'
import type { CharacterClass } from '../types'

const CLASS_OPTIONS: CharacterClass[] = ['warrior', 'mage', 'rogue', 'ranger', 'healer']

export function CreateCharacterForm() {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null)
  const createCharacter = useCreateCharacter()

  const canSubmit =
    name.trim().length > 0 && title.trim().length > 0 && characterClass !== null && !createCharacter.isPending

  function handleSubmit() {
    if (!canSubmit || !characterClass) return
    createCharacter.mutate({ name: name.trim(), title: title.trim(), class: characterClass })
  }

  return (
    <YStack gap="$4">
      <YStack alignItems="center" gap="$1">
        <Text color="$soloCyan" fontSize="$3" letterSpacing={4} textTransform="uppercase">
          Registration
        </Text>
        <Text color="$soloText" fontSize={22} fontWeight="800" textAlign="center">
          Awaken as a Hunter
        </Text>
        <Text color="$soloTextMuted" fontSize="$3" textAlign="center">
          The System has no record of you yet. Register your Hunter to proceed.
        </Text>
      </YStack>

      <YStack gap="$2">
        <Text color="$soloTextMuted" fontSize="$2" letterSpacing={1} textTransform="uppercase">
          Name
        </Text>
        <SystemInput value={name} onChangeText={setName} placeholder="Sung Jinwoo" autoCapitalize="words" />
      </YStack>

      <YStack gap="$2">
        <Text color="$soloTextMuted" fontSize="$2" letterSpacing={1} textTransform="uppercase">
          Title
        </Text>
        <SystemInput value={title} onChangeText={setTitle} placeholder="The Weakest Hunter" autoCapitalize="words" />
      </YStack>

      <YStack gap="$2">
        <Text color="$soloTextMuted" fontSize="$2" letterSpacing={1} textTransform="uppercase">
          Class
        </Text>
        <XStack flexWrap="wrap" gap="$2">
          {CLASS_OPTIONS.map((option) => (
            <SystemButton
              key={option}
              size="$3"
              backgroundColor={characterClass === option ? '$soloBlue' : '$soloPanelAlt'}
              borderColor={characterClass === option ? '$soloCyan' : '$soloBorder'}
              onPress={() => setCharacterClass(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </SystemButton>
          ))}
        </XStack>
      </YStack>

      {createCharacter.isError && (
        <Text color="$soloDanger" fontSize="$2">
          {getErrorMessage(createCharacter.error)}
        </Text>
      )}

      <SystemButton onPress={handleSubmit} disabled={!canSubmit}>
        {createCharacter.isPending ? 'Registering…' : 'Register Hunter'}
      </SystemButton>
    </YStack>
  )
}
