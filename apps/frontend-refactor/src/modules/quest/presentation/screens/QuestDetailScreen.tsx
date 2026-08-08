import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import {
  Badge,
  Button,
  EmptyState,
  Loading,
  Panel,
  ProgressBar,
  Screen,
  ScreenHeader,
  SystemNotice,
  Text,
} from '@/shared/components'
import { useStartQuest } from '../../application/useStartQuest'
import { useCompleteQuest } from '../../application/useCompleteQuest'
import { useUpdateObjective } from '../../application/useUpdateObjective'
import {
  OBJECTIVE_COMPLETION_THRESHOLD,
  canComplete,
  isFinishedQuestStatus,
  objectivesCompletionRatio,
} from '../../domain/quest-instance.rules'
import { QuestObjectiveRow } from '../components/QuestObjectiveRow'
import { QuestStatusBadge } from '../components/QuestStatusBadge'
import { useQuestsById } from '../../application/useQuestById'
import type { QuestFullInstance } from '../../domain/quest-instance.types'
import { useQuestCategories } from '../../application/useQuestCategories'

export function QuestDetailScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: categories } = useQuestCategories()
  const { data: questResponse, isLoading } = useQuestsById(id)
  const { quest, ...instance } = questResponse ?? ({} as QuestFullInstance)

  const startQuest = useStartQuest()
  const completeQuest = useCompleteQuest(quest?.rewardXp ?? 0)
  const updateObjective = useUpdateObjective()

  const header = (
    <ScreenHeader
      title={t('quest.detail.title')}
      eyebrow={t('common.systemLabel')}
      onBack={() =>
        router.push({
          pathname: '/quests',
        })
      }
    />
  )

  if (isLoading) {
    return (
      <Screen>
        {header}
        <Loading label={t('quest.list.loading')} />
      </Screen>
    )
  }

  if (!quest || !instance) {
    return (
      <Screen>
        {header}
        <EmptyState title={t('quest.detail.notFound')} />
      </Screen>
    )
  }

  const category = categories?.find((cat) => quest.categoryId === cat.id)
  const completedCount =
    (instance?.objectives ?? []).filter((objective) => objective.completed).length ?? 0
  const totalObjectives = (instance?.objectives ?? []).length ?? 0
  const completionRatio = objectivesCompletionRatio(instance?.objectives ?? [])
  const showThresholdHint =
    instance !== null &&
    totalObjectives > 0 &&
    !isFinishedQuestStatus(instance.status) &&
    completionRatio <= OBJECTIVE_COMPLETION_THRESHOLD

  return (
    <Screen scroll>
      {header}
      <View className="gap-5 flex-1">
        <View className="flex-1">
          <Panel className={`gap-3 ${instance?.objectives?.length ? 'flex-1' : ''}`}>
            <View className="flex-row items-start justify-between gap-3">
              <Text weight="bold" className="flex-1 text-2xl text-content flex justify-center">
                {quest.title}
              </Text>
              {/* <Badge label={quest.rank} tone="legendary" /> */}
            </View>
            <Text className="text-sm text-content-muted flex justify-center">
              {quest.description}
            </Text>
            <Text className="text-sm text-content flex justify-center">
              RANK <Badge label={quest.rank} tone="legendary" />
            </Text>
            <View className="py-5 gap-2">
              {instance && totalObjectives > 0 ? (
                <>
                  <Text
                    weight="semibold"
                    className="text-xs uppercase tracking-widest text-content-muted"
                  >
                    {t('quest.detail.objectives', {
                      completed: completedCount,
                      total: totalObjectives,
                    })}
                  </Text>
                  <ProgressBar
                    value={completionRatio}
                    max={1}
                    tone={completionRatio >= 0.7 ? 'success' : 'primary'}
                    className="h-1.5 flex-1"
                  />
                </>
              ) : null}
              {(instance?.objectives ?? []).map((objective) => (
                <QuestObjectiveRow
                  key={objective.id}
                  objective={objective}
                  // disabled={instance.status !== 'STARTED'}
                  disabled={false}
                  onComplete={() =>
                    updateObjective.mutate({ instanceId: instance.id, objectiveId: objective.id })
                  }
                  onChangeCurrent={(current) =>
                    updateObjective.mutate({
                      instanceId: instance.id,
                      objectiveId: objective.id,
                      current,
                    })
                  }
                />
              ))}
              {showThresholdHint ? (
                <SystemNotice variant="warning" message={t('quest.detail.thresholdHint')} />
              ) : null}
            </View>
            <View className="flex-1" />
            <View className="flex-row items-center gap-2 pt-1">
              {/* <QuestStatusBadge status={instance.status} />
              <Badge
                label={t(`quest.category.${(category?.name ?? 'pessoal').toLowerCase()}`)}
                tone="muted"
              /> */}
              <Text weight="bold" className="text-primary">
                {t('quest.detail.completeBy').toUpperCase()}{' '}
                {instance.deadline
                  ? new Date(instance.deadline).toLocaleDateString('pt-br')
                  : 'N/A'}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 pt-1">
              <Badge label={t(`quest.recurrence.${quest.recurrence}`)} tone="muted" />
              <Badge
                label={t(`quest.category.${(category?.name ?? 'pessoal').toLowerCase()}`)}
                tone="muted"
              />
              <QuestStatusBadge status={instance.status} />
              <View className="flex-1" />
              <Text weight="bold" className="text-primary">
                {t('quest.list.reward', { xp: quest.rewardXp })}
              </Text>
            </View>
          </Panel>

          {!instance ? (
            <SystemNotice message={t('quest.detail.notActionable')} />
          ) : instance.status === 'PENDING' ? (
            <Button
              label={startQuest.isPending ? t('quest.detail.starting') : t('quest.detail.start')}
              loading={startQuest.isPending}
              onPress={() => startQuest.mutate(instance.id)}
            />
          ) : instance.status === 'STARTED' ? (
            <Button
              label={
                completeQuest.isPending ? t('quest.detail.completing') : t('quest.detail.complete')
              }
              loading={completeQuest.isPending}
              disabled={!canComplete(instance)}
              onPress={() => completeQuest.mutate(instance.id)}
            />
          ) : null}
        </View>
        <Button label="Recriar Quest" />
      </View>
    </Screen>
  )
}
