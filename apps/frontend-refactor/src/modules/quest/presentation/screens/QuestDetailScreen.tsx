import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import {
  Badge,
  Button,
  EmptyState,
  Loading,
  Panel,
  Screen,
  ScreenHeader,
  SystemCard,
  SystemNotice,
  Text,
} from '@/shared/components'
import { useQuests } from '../../application/useQuests'
import { useTodayQuests } from '../../application/useTodayQuests'
import { useStartQuest } from '../../application/useStartQuest'
import { useCompleteQuest } from '../../application/useCompleteQuest'
import { useUpdateObjective } from '../../application/useUpdateObjective'
import {
  OBJECTIVE_COMPLETION_THRESHOLD,
  canComplete,
  isTerminalStatus,
  objectivesCompletionRatio,
} from '../../domain/quest-instance.rules'
import { QuestObjectiveRow } from '../components/QuestObjectiveRow'
import { QuestStatusBadge } from '../components/QuestStatusBadge'
import { useQuestsById } from '../../application/useQuestById'
import type { QuestFullInstance } from '../../domain/quest-instance.types'

export function QuestDetailScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: questResponse, isLoading } = useQuestsById(id)
  const { quest, ...instance } = questResponse ?? ({} as QuestFullInstance)

  const startQuest = useStartQuest()
  const completeQuest = useCompleteQuest(quest?.rewardXp ?? 0)
  const updateObjective = useUpdateObjective()

  const header = (
    <ScreenHeader
      title={t('quest.detail.title')}
      eyebrow={t('common.systemLabel')}
      onBack={() => router.back()}
      // right={instance ? <QuestStatusBadge status={instance.status} /> : undefined}
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

  const completedCount =
    (instance?.objectives ?? []).filter((objective) => objective.completed).length ?? 0
  const totalObjectives = (instance?.objectives ?? []).length ?? 0
  const showThresholdHint =
    instance !== null &&
    totalObjectives > 0 &&
    !isTerminalStatus(instance.status) &&
    objectivesCompletionRatio(instance?.objectives ?? []) <= OBJECTIVE_COMPLETION_THRESHOLD

  return (
    <Screen scroll>
      {header}
      <View className="gap-5">
        {/* <SystemCard className="gap-3"> */}
        <Panel className="gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <Text weight="bold" className="flex-1 text-2xl text-content">
              {quest.title}
            </Text>
            <Badge label={quest.rank} tone="legendary" />
          </View>
          <Text className="text-sm text-content-muted">{quest.description}</Text>
          <View className="flex-row items-center gap-2 pt-1">
            <QuestStatusBadge status={instance.status} />
            {/* <Badge label={t(`quest.category.${quest.category.toLowerCase()}`)} tone="muted" /> */}
            <View className="flex-1" />
            <Text weight="bold" className="text-primary">
              FINALIZAR ATÉ{' '}
              {instance.deadline ? new Date(instance.deadline).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 pt-1">
            <Badge label={t(`quest.recurrence.${quest.recurrence}`)} tone="muted" />
            <View className="flex-1" />
            <Text weight="bold" className="text-primary">
              {t('quest.list.reward', { xp: quest.rewardXp })}
            </Text>
          </View>
        </Panel>

        {instance && totalObjectives > 0 ? (
          <Panel className="gap-3">
            <Text
              weight="semibold"
              className="text-xs uppercase tracking-widest text-content-muted"
            >
              {t('quest.detail.objectives', {
                completed: completedCount,
                total: totalObjectives,
              })}
            </Text>
            {(instance?.objectives ?? []).map((objective) => (
              <QuestObjectiveRow
                key={objective.id}
                objective={objective}
                disabled={isTerminalStatus(instance.status) || updateObjective.isPending}
                onComplete={() =>
                  updateObjective.mutate({ instanceId: instance.id, objectiveId: objective.id })
                }
              />
            ))}
            {showThresholdHint ? (
              <SystemNotice variant="warning" message={t('quest.detail.thresholdHint')} />
            ) : null}
          </Panel>
        ) : null}

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
        {/* </SystemCard> */}
      </View>
    </Screen>
  )
}
