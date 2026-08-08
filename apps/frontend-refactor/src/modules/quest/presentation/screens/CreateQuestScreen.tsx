import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import {
  Button,
  ControlledInput,
  FormField,
  Panel,
  Screen,
  ScreenHeader,
  Select,
  Text,
} from '@/shared/components'
import { QUEST_RANKS, xpForQuestRank, type QuestRank } from '../../domain/quest-rank'
import { SCHEDULABLE_RECURRENCES } from '../../domain/recurrence'
import { useCreateQuest } from '../../application/useCreateQuest'
import { useQuestCategories } from '../../application/useQuestCategories'
import {
  createQuestSchema,
  type CreateQuestFormInput,
  type CreateQuestFormValues,
} from '../../schemas/create-quest.schema'
import { ObjectiveFields } from '../components/ObjectiveFields'

export function CreateQuestScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const createQuest = useCreateQuest()
  const { data: categories } = useQuestCategories()
  const schema = useMemo(() => createQuestSchema(t), [t])

  const { control, handleSubmit } = useForm<CreateQuestFormInput, unknown, CreateQuestFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      rank: 'E',
      recurrence: 'NONE',
      categoryId: null,
      objectives: [],
    },
  })

  const rank = (useWatch({ control, name: 'rank' }) ?? 'E') as QuestRank
  const rewardXp = xpForQuestRank(rank)

  const rankOptions = QUEST_RANKS.map((value) => ({
    label: value,
    value,
    hint: `${xpForQuestRank(value)} XP`,
  }))
  const recurrenceOptions = SCHEDULABLE_RECURRENCES.map((value) => ({
    label: t(`quest.recurrence.${value}`),
    value,
  }))
  const categoryOptions = [
    ...(categories ?? []).map((category) => ({ label: category.name, value: category.id })),
  ]

  function onSubmit(values: CreateQuestFormValues) {
    createQuest.mutate({
      title: values.title,
      description: values.description,
      rank: values.rank,
      recurrence: values.recurrence,
      categoryId: values.categoryId || null,
      objectives: values.objectives,
    })
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title={t('quest.create.title')}
        subtitle={t('quest.create.subtitle')}
        eyebrow={t('common.systemLabel')}
        onBack={() => router.back()}
      />

      <View className="gap-5">
        <Panel className="gap-4">
          <ControlledInput
            control={control}
            name="title"
            label={t('quest.create.titleField')}
            inputProps={{ placeholder: t('quest.create.titlePlaceholder') }}
          />
          <ControlledInput
            control={control}
            name="description"
            label={t('quest.create.description')}
            inputProps={{ placeholder: t('quest.create.descriptionPlaceholder'), multiline: true }}
          />
          <FormField
            label={t('quest.create.rank')}
            hint={t('quest.create.rankHint', { xp: rewardXp })}
          >
            <Controller
              control={control}
              name="rank"
              render={({ field }) => (
                <Select options={rankOptions} value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label={t('quest.create.recurrence')}>
            <Controller
              control={control}
              name="recurrence"
              render={({ field }) => (
                <Select options={recurrenceOptions} value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label={t('quest.create.category')}>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  options={categoryOptions}
                  value={field.value ?? categoryOptions[0]?.value ?? ''}
                  onChange={(value) => field.onChange(value || null)}
                />
              )}
            />
          </FormField>
        </Panel>

        <Panel>
          <ObjectiveFields control={control} />
        </Panel>

        <View className="flex-row items-center justify-between rounded-xl border border-line bg-surface/60 px-4 py-3">
          <Text weight="semibold" className="text-xs uppercase tracking-widest text-content-muted">
            {t('quest.create.rewardPreview')}
          </Text>
          <Text weight="bold" className="text-xl text-primary">
            {t('quest.create.rewardValue', { xp: rewardXp })}
          </Text>
        </View>

        <Button
          label={createQuest.isPending ? t('quest.create.submitting') : t('quest.create.submit')}
          loading={createQuest.isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </Screen>
  )
}
