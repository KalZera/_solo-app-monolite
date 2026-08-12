import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import {
  Badge,
  BottomSheet,
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
import { QuestCategoryIcon } from '../components/QuestCategoryIcon'
import { useQuestsById } from '../../application/useQuestById'
import type { QuestFullInstance } from '../../domain/quest-instance.types'
import { useQuestCategories } from '../../application/useQuestCategories'
import { Calendar, ArrowUp10, CircleCheckBig } from 'lucide-react-native'
import { rankTone } from '../components/rank-tone'
import { colors } from '@/shared/theme/colors'

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
  const [showRecreateConfirm, setShowRecreateConfirm] = useState(false)

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
            <View className="flex-row items-center justify-between gap-3">
              <QuestCategoryIcon categoryName={category?.name} />
              <View className="flex flex-column flex-start items-start flex-1">
                <Text weight="bold" className="flex-1 text-2xl text-content flex uppercase">
                  {quest.title}
                </Text>
              </View>
              <View>
                <Badge
                  label={quest.rank}
                  tone={rankTone[quest.rank] ?? 'primary'}
                  className="h-10 w-10 items-center justify-center"
                  classNameText="text-[24px]"
                />
              </View>
            </View>
            <View className="flex flex-row gap-2">
              <View className="flex-1 items-center rounded-lg px-3 py-2 border border-primary/60 bg-primary/15 flex-row">
                <View>
                  <Calendar color="#FFF" />
                </View>
                <View>
                  <Text className="text-xs uppercase tracking-wide text-primary">
                    {' '}
                    {t(`quest.detail.type`)}{' '}
                  </Text>
                  <Text
                    weight={'semibold'}
                    className="text-xs uppercase tracking-wide text-primary"
                  >
                    {' '}
                    {t(`quest.recurrence.${quest.recurrence}`)}{' '}
                  </Text>
                </View>
              </View>
              <View className="flex-1 items-center rounded-lg px-3 py-2 border border-primary/60 bg-primary/15 flex-row">
                <View>
                  <ArrowUp10 color="#FFF" />
                </View>
                <View>
                  <Text className="text-xs uppercase tracking-wide text-primary">
                    {' '}
                    {t(`quest.detail.reward`)}{' '}
                  </Text>
                  <Text
                    weight={'semibold'}
                    className="text-xs uppercase tracking-wide text-primary"
                  >
                    {' '}
                    {t('quest.list.reward', { xp: quest.rewardXp })}
                  </Text>
                </View>
              </View>
            </View>
            <View>
              <View className="flex flex-row gap-2">
                <View className="flex-1 rounded-lg px-3 py-2 border border-primary/60 bg-primary/15">
                  <Text className="text-xs uppercase tracking-wide text-primary pb-2">
                    {' '}
                    {t(`quest.detail.description`)}{' '}
                  </Text>
                  <Text weight={'semibold'} className="text-xs tracking-wide text-content">
                    {quest.description}
                  </Text>
                </View>
              </View>
            </View>
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
                  disabled={instance.status !== 'STARTED'}
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
              <View className="items-center rounded-lg px-3 py-2 border border-primary/60 bg-primary/15 flex-row gap-2">
                <View>
                  <Calendar color="#FFF" />
                </View>
                <View>
                  <Text className="text-xs uppercase tracking-wide text-primary">
                    {' '}
                    {t('quest.detail.completeBy').toUpperCase()}{' '}
                  </Text>
                  <Text
                    weight={'semibold'}
                    className="text-xs uppercase tracking-wide text-primary"
                  >
                    {instance.deadline
                      ? new Date(instance.deadline).toLocaleDateString('pt-br')
                      : 'N/A'}
                  </Text>
                </View>
              </View>
              <View className="rounded-lg px-3 py-2 border border-primary/60 bg-primary/15">
                <Text className="text-xs uppercase tracking-wide text-primary">
                  {' '}
                  {t('quest.detail.status').toUpperCase()}{' '}
                </Text>
                <Text weight={'semibold'} className="text-xs uppercase tracking-wide text-primary">
                  <QuestStatusBadge status={instance.status} />
                </Text>
              </View>
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
          ) : instance.status === 'COMPLETED' ? (
            <Button
              icon={<CircleCheckBig size={16} color={colors.success} />}
              label={t('quest.detail.completeSuccessTitle')}
              classNameLabel={`text-[${colors.success}]`}
            />
          ) : null}
        </View>
        <Button
          label={t('quest.detail.recreateTitle')}
          onPress={() => setShowRecreateConfirm(true)}
        />
      </View>

      <BottomSheet
        visible={showRecreateConfirm}
        onClose={() => setShowRecreateConfirm(false)}
        title={t('quest.detail.recreateTitle')}
        message={t('quest.detail.recreateMessage')}
        onConfirm={() => {
          setShowRecreateConfirm(false)
          router.push({
            pathname: '/quests/new',
            params: {
              title: quest.title,
              description: quest.description,
              rank: quest.rank,
              recurrence: quest.recurrence,
              categoryId: quest.categoryId ?? '',
              deadlineDate: quest.deadlineDate,
              objectives: JSON.stringify(
                (quest.objectiveTemplates ?? []).map((objective) => ({
                  description: objective.description,
                  target: objective.target,
                })),
              ),
            },
          })
        }}
      />
    </Screen>
  )
}
