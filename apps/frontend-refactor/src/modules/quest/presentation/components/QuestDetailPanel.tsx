import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Badge, Panel, ProgressBar, SystemNotice, Text } from '@/shared/components'
import { ArrowUp10, Calendar } from 'lucide-react-native'
import {
  OBJECTIVE_COMPLETION_THRESHOLD,
  isFinishedQuestStatus,
  objectivesCompletionRatio,
} from '../../domain/quest-instance.rules'
import type { Quest } from '../../domain/quest.types'
import type { QuestFullInstance } from '../../domain/quest-instance.types'
import { QuestObjectiveRow } from './QuestObjectiveRow'
import { QuestStatusBadge } from './QuestStatusBadge'
import { QuestCategoryIcon } from './QuestCategoryIcon'
import { rankTone } from './rank-tone'

interface QuestDetailPanelProps {
  quest: Quest
  instance: Omit<QuestFullInstance, 'quest'>
  categoryName?: string
  onUpdateObjective: (input: { objectiveId: string; current?: number }) => void
}

/** Read-only "System window" card for a quest: header, meta chips, objectives and status. */
export function QuestDetailPanel({
  quest,
  instance,
  categoryName,
  onUpdateObjective,
}: QuestDetailPanelProps) {
  const { t } = useTranslation()

  const objectives = instance?.objectives ?? []
  const completedCount = objectives.filter((objective) => objective.completed).length
  const totalObjectives = objectives.length
  const completionRatio = objectivesCompletionRatio(objectives)
  const showThresholdHint =
    totalObjectives > 0 &&
    !isFinishedQuestStatus(instance.status) &&
    completionRatio <= OBJECTIVE_COMPLETION_THRESHOLD

  return (
    <Panel className={`gap-3 ${objectives.length ? 'flex-1' : ''}`}>
      <View className="flex-row items-center justify-between gap-3">
        <QuestCategoryIcon categoryName={categoryName} />
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
            <Text weight={'semibold'} className="text-xs uppercase tracking-wide text-primary">
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
            <Text weight={'semibold'} className="text-xs uppercase tracking-wide text-primary">
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
        {totalObjectives > 0 ? (
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
        {objectives.map((objective) => (
          <QuestObjectiveRow
            key={objective.id}
            objective={objective}
            disabled={instance.status !== 'STARTED'}
            onComplete={() => onUpdateObjective({ objectiveId: objective.id })}
            onChangeCurrent={(current) => onUpdateObjective({ objectiveId: objective.id, current })}
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
            <Text weight={'semibold'} className="text-xs uppercase tracking-wide text-primary">
              {instance.deadline ? new Date(instance.deadline).toLocaleDateString('pt-br') : 'N/A'}
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
  )
}
