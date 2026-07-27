import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { ChevronLeft } from '@tamagui/lucide-icons-2'
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { FormField } from '@/shared/components/FormField'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useCreateQuest } from '../api/useCreateQuest'
import {
  QUEST_TYPE_OPTIONS,
  createQuestSchema,
  type CreateQuestFormInput,
  type CreateQuestFormValues,
} from '../schemas/create-quest.schema'

const QUEST_TYPE_LABELS: Record<(typeof QUEST_TYPE_OPTIONS)[number], string> = {
  daily: 'Daily',
  main: 'Main',
}

export function CreateQuestScreen() {
  const router = useRouter()
  const createQuest = useCreateQuest()

  const { control, handleSubmit } = useForm<CreateQuestFormInput, unknown, CreateQuestFormValues>({
    resolver: zodResolver(createQuestSchema),
    defaultValues: { title: '', description: '', questRank: '', type: 'daily', rewardXp: '' },
  })

  function onSubmit(values: CreateQuestFormValues) {
    createQuest.mutate(values, { onSuccess: () => router.back() })
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
          <FormField control={control} name="title" label="Title" inputProps={{ placeholder: 'Train for 30 minutes' }} />

          <FormField
            control={control}
            name="description"
            label="Description"
            inputProps={{ placeholder: 'Spend 30 minutes training' }}
          />

          <FormField
            control={control}
            name="questRank"
            label="Rank"
            inputProps={{ placeholder: 'E, D, C, B, A, S', autoCapitalize: 'characters' }}
          />

          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <YStack gap="$2">
                <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                  Type
                </Text>
                <XStack gap="$2">
                  {QUEST_TYPE_OPTIONS.map((option) => (
                    <SystemButton
                      key={option}
                      flex={1}
                      backgroundColor={value === option ? '$soloBlue' : '$soloPanelAlt'}
                      onPress={() => onChange(option)}
                    >
                      {QUEST_TYPE_LABELS[option]}
                    </SystemButton>
                  ))}
                </XStack>
              </YStack>
            )}
          />

          <FormField
            control={control}
            name="rewardXp"
            label="XP Reward"
            inputProps={{ placeholder: '10', keyboardType: 'numeric' }}
          />

          {createQuest.isError && (
            <Text color="$soloDanger" fontSize="$2">
              {getErrorMessage(createQuest.error)}
            </Text>
          )}

          <SystemButton onPress={handleSubmit(onSubmit)} disabled={createQuest.isPending}>
            {createQuest.isPending ? 'Creating…' : 'Create Quest'}
          </SystemButton>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
