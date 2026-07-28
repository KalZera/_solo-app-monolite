import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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

export function CreateQuestScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const createQuest = useCreateQuest()
  const { data: categories } = useQuestCategories()
  const questSchema = useMemo(() => createQuestSchema(t), [t])

  const { control, handleSubmit, setValue } = useForm<CreateQuestFormInput, unknown, CreateQuestFormValues>({
    resolver: zodResolver(questSchema),
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

  const {
    fields: objectiveFields,
    append: appendObjective,
    remove: removeObjective,
  } = useFieldArray({
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

  const rankSelectOptions = QUEST_RANK_OPTIONS.map((rank) => ({
    label: `${t('quest.detail.rank')} ${rank} (${calculateRewardXpForRank(rank)} XP)`,
    value: rank,
  }))

  const typeSelectOptions = QUEST_TYPE_OPTIONS.map((type) => ({
    label: t(`quest.types.${type}`),
    value: type,
  }))

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
            {t('quest.create.title')}
          </Text>
        </XStack>

        <SystemPanel gap="$4">
          <FormField
            control={control}
            name="title"
            label={t('quest.create.titleField')}
            inputProps={{ placeholder: t('quest.create.titlePlaceholder') }}
          />

          <FormField
            control={control}
            name="description"
            label={t('quest.create.description')}
            inputProps={{ placeholder: t('quest.create.descriptionPlaceholder') }}
          />

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              {t('quest.create.rank')}
            </Text>
            <Controller
              control={control}
              name="questRank"
              render={({ field: { onChange, value } }) => (
                <SystemSelect
                  value={value}
                  onValueChange={onChange}
                  options={rankSelectOptions}
                  placeholder={t('quest.create.rankPlaceholder')}
                />
              )}
            />
          </YStack>

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              {t('quest.create.type')}
            </Text>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <SystemSelect
                  value={value}
                  onValueChange={onChange}
                  options={typeSelectOptions}
                  placeholder={t('quest.create.typePlaceholder')}
                />
              )}
            />
          </YStack>

          <YStack gap="$2">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              {t('quest.create.category')}
            </Text>
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { onChange, value } }) => (
                <SystemSelect
                  value={value ?? undefined}
                  onValueChange={onChange}
                  options={categoryOptions}
                  placeholder={t('quest.create.categoryPlaceholder')}
                />
              )}
            />
          </YStack>

          <YStack gap="$1">
            <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
              {t('quest.create.xpReward')}
            </Text>
            <Text color="$soloCyan" fontSize="$6" fontWeight="800">
              {calculateRewardXpForRank(selectedRank)} XP
            </Text>
          </YStack>

          {selectedType === 'main' && (
            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$soloTextMuted" fontSize="$2" textTransform="uppercase">
                  {t('quest.create.objectives')}
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
                  {t('quest.create.add')}
                </Button>
              </XStack>

              {objectiveFields.length === 0 && (
                <Text color="$soloTextMuted" fontSize="$2">
                  {t('quest.create.objectivesHint')}
                </Text>
              )}

              {objectiveFields.map((field, index) => (
                <XStack key={field.id} gap="$2" alignItems="flex-end">
                  <YStack flex={2}>
                    <FormField
                      control={control}
                      name={`objectives.${index}.description`}
                      label={t('quest.create.objectiveLabel', { number: index + 1 })}
                      inputProps={{ placeholder: t('quest.create.objectivePlaceholder') }}
                    />
                  </YStack>
                  <YStack flex={1}>
                    <FormField
                      control={control}
                      name={`objectives.${index}.target`}
                      label={t('quest.create.target')}
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
            {createQuest.isPending ? t('quest.create.submitting') : t('quest.create.submit')}
          </SystemButton>
        </SystemPanel>
      </YStack>
    </ScrollView>
  )
}
