import { Pressable, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Badge, Panel, Text, type BadgeTone } from '@/shared/components'
import type { Quest } from '../../domain/quest.types'
import type { QuestInstance } from '../../domain/quest-instance.types'
import { QuestStatusBadge } from './QuestStatusBadge'

const rankTone: Record<string, BadgeTone> = {
  E: 'muted',
  D: 'primary',
  C: 'success',
  B: 'warning',
  A: 'epic',
  S: 'legendary',
}

interface QuestCardProps {
  quest: Quest
  // instance?: QuestInstance | null
  onPress?: () => void
}

export function QuestCard({ quest, onPress }: QuestCardProps) {
  const { t } = useTranslation()
  const objectivesCount = quest.objectiveTemplates.length

  const card = (
    <Panel className="gap-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text weight="semibold" className="text-lg text-content">
            {quest.title}
          </Text>
          <Text numberOfLines={2} className="text-sm text-content-muted">
            {quest.description}
          </Text>
        </View>
        <Badge label={quest.rank} tone={rankTone[quest.rank] ?? 'primary'} />
      </View>

      <View className="flex-row flex-wrap items-center gap-2">
        <Badge label={t(`quest.recurrence.${quest.recurrence}`)} tone="muted" />
        {/* {instance ? <QuestStatusBadge status={instance.status} /> : null} */}
        <View className="flex-1" />
        {objectivesCount > 0 ? (
          <Text className="text-xs text-content-muted">
            {t('quest.list.objectivesCount', { count: objectivesCount })}
          </Text>
        ) : null}
        <Text weight="bold" className="text-primary">
          {t('quest.list.reward', { xp: quest.rewardXp })}
        </Text>
      </View>
    </Panel>
  )

  if (!onPress) return card

  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-80">
      {card}
    </Pressable>
  )
}
