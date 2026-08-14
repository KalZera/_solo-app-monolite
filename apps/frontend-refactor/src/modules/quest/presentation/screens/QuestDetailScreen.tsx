import { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import {
  BottomSheet,
  Button,
  EmptyState,
  Loading,
  Screen,
  ScreenHeader,
  SystemNotice,
  Text,
} from '@/shared/components'
import { CalendarOff } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { CircleCheckBig } from 'lucide-react-native'
import { useStartQuest } from '../../application/useStartQuest'
import { useCompleteQuest } from '../../application/useCompleteQuest'
import { useUpdateObjective } from '../../application/useUpdateObjective'
import { useStopRecurrence } from '../../application/useStopRecurrence'
import { useQuestsById } from '../../application/useQuestById'
import { useQuestCategories } from '../../application/useQuestCategories'
import { canComplete } from '../../domain/quest-instance.rules'
import type { QuestFullInstance } from '../../domain/quest-instance.types'
import { QuestDetailPanel } from '../components/QuestDetailPanel'

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
  const stopRecurrence = useStopRecurrence()
  const [showRecreateConfirm, setShowRecreateConfirm] = useState(false)
  const [showStopRecurrenceConfirm, setShowStopRecurrenceConfirm] = useState(false)

  const header = (
    <ScreenHeader
      title={t('quest.detail.title')}
      eyebrow={t('common.systemLabel')}
      onBack={() => router.push({ pathname: '/quests' })}
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

  return (
    <Screen scroll>
      {header}
      <View className="gap-5 flex-1">
        <View className="flex-1">
          <QuestDetailPanel
            quest={quest}
            instance={instance}
            categoryName={category?.name}
            onUpdateObjective={({ objectiveId, current }) =>
              updateObjective.mutate({ instanceId: instance.id, objectiveId, current })
            }
          />

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

        {quest.recurrence !== 'NONE' ? (
          quest.active === 'ACTIVE' ? (
            <Button
              label={t('quest.detail.stopRecurrence')}
              variant="secondary"
              icon={<CalendarOff size={16} color={colors.contentMuted} />}
              onPress={() => setShowStopRecurrenceConfirm(true)}
            />
          ) : (
            <View className="flex-row items-center justify-center gap-2 py-1">
              <CalendarOff size={14} color={colors.contentMuted} />
              <Text className="text-xs uppercase tracking-wide text-content-muted">
                {quest.active === 'COMPLETED'
                  ? t('quest.detail.recurrenceCompleted')
                  : t('quest.detail.recurrenceStopped')}
              </Text>
            </View>
          )
        ) : null}
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

      <BottomSheet
        visible={showStopRecurrenceConfirm}
        onClose={() => setShowStopRecurrenceConfirm(false)}
        variant="warning"
        title={t('quest.detail.stopRecurrenceTitle')}
        message={t('quest.detail.stopRecurrenceMessage')}
        confirmLabel={t('quest.detail.stopRecurrenceConfirm')}
        confirmLoading={stopRecurrence.isPending}
        onConfirm={() =>
          stopRecurrence.mutate(quest.id, {
            onSuccess: () => setShowStopRecurrenceConfirm(false),
          })
        }
      />
    </Screen>
  )
}
