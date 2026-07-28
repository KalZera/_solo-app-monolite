import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { ChevronLeft, Plus, Trash2 } from '@tamagui/lucide-icons-2'
import { Button, ScrollView, Text, XStack, YStack } from 'tamagui'
import { SystemButton } from '@/shared/components/SystemButton'
import { FormField } from '@/shared/components/FormField'
import { SystemPanel } from '@/shared/components/SystemPanel'
import { SystemSelect } from '@/shared/components/SystemSelect'
import { getErrorMessage } from '@/shared/api/get-error-message'
import { useCreateQuest } from '../api/useCreateQuest'
import { useQuestCategories } from '../api/useQuestCategories'
import {
  QUEST_RANK_OPTIONS,
  QUEST_TYPE_OPTIONS,
  calculateRewardXpForRank,
  createQuestSchema,
  type CreateQuestFormInput,
  type CreateQuestFormValues,
} from '../schemas/create-quest.schema'

const QUEST_TYPE_LABELS: Record<(typeof QUEST_TYPE_OPTIONS)[number], string> = {
  daily: 'Daily',
  main: 'Main',
}

const RANK_SELECT_OPTIONS = QUEST_RANK_OPTIONS.map((rank) => ({
  label: `Rank ${rank} (${calculateRewardXpForRank(rank)} XP)`,
  value: rank,
}))

const TYPE_SELECT_OPTIONS = QUEST_TYPE_OPTIONS.map((type) => ({ label: QUEST_TYPE_LABELS[type], value: type }))

export function CreateQuestScreen() {
  const router = useRouter()
  const createQuest = useCreateQuest()
  const { data: categories } = useQuestCategories()

  const { control, handleSubmit, setValue } = useForm<CreateQuestFormInput, unknown, CreateQuestFormValues>({
    resolver: zodResolver(createQuestSchema),
    defaultValues: {
      title: '',
      description: '',
      questRank: 'E',
      type: 'daily',
      categoryId: null,
      rewardXp: calculateRewardXpForRank('E'),
      objectives: [],
    },
  })

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control,
    name: 'objectives',
  })

  const selectedRank = useWatch({ control, name: 'questRank' })
  const selectedType = useWatch({ control, name: 'type' })

  useEffect(() => {
    setValue('rewardXp', calculateRewardXpForRank(selectedRank))
  }, [selectedRank, setValue])

  function onSubmit(values: CreateQuestFormValues) {
    createQuest.mutate(values, { onSuccess: () => router.back() })
  }

  const categoryOptions = (categories ?? []).map((category) => ({ label: category.name, value: category.id }))

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

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              Rank
            </Text>
            <Controller
              control={control}
              name="questRank"
              render={({ field: { onChange, value } }) => (
                <SystemSelect value={value} onValueChange={onChange} options={RANK_SELECT_OPTIONS} placeholder="Select a rank" />
              )}
            />
          </YStack>

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              Type
            </Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <SystemSelect value={value} onValueChange={onChange} options={TYPE_SELECT_OPTIONS} placeholder="Select a type" />
              )}
            />
          </YStack>

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              Category
            </Text>
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { onChange, value } }) => (
                <SystemSelect
                  value={value ?? undefined}
                  onValueChange={onChange}
                  options={categoryOptions}
                  placeholder="Select a category"
                />
              )}
            />
          </YStack>

          <YStack gap="$1">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              XP Reward
            </Text>
            <Text color="$soloCyan" fontSize="$6" fontWeight="800">
              {calculateRewardXpForRank(selectedRank)} XP
            </Text>
          </YStack>

          {selectedType === 'main' && (
            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                  Objectives
                </Text>
                <Button
                  size="$2"
                  chromeless
                  borderWidth={1}
                  borderColor="$soloBorderStrong"
                  backgroundColor="$soloPanelAlt"
                  icon={<Plus color="$soloCyan" size={14} />}
                  onPress={() => appendObjective({ description: '', target: '' })}
                >
                  Add
                </Button>
              </XStack>

              {objectiveFields.length === 0 && (
                <Text color="$soloTextMuted" fontSize="$2">
                  A main quest is completed once more than 70% of its objectives are done. Add at least one.
                </Text>
              )}

              {objectiveFields.map((field, index) => (
                <XStack key={field.id} gap="$2" alignItems="flex-end">
                  <YStack flex={2}>
                    <FormField
                      control={control}
                      name={`objectives.${index}.description`}
                      label={`Objective ${index + 1}`}
                      inputProps={{ placeholder: 'Read 100 pages' }}
                    />
                  </YStack>
                  <YStack flex={1}>
                    <FormField
                      control={control}
                      name={`objectives.${index}.target`}
                      label="Target"
                      inputProps={{ placeholder: '1', keyboardType: 'numeric' }}
                    />
                  </YStack>
                  <Button
                    size="$3"
                    circular
                    chromeless
                    borderWidth={1}
                    borderColor="$soloBorderStrong"
                    backgroundColor="$soloPanelAlt"
                    icon={<Trash2 color="$soloDanger" size={14} />}
                    onPress={() => removeObjective(index)}
                  />
                </XStack>
              ))}
            </YStack>
          )}

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
