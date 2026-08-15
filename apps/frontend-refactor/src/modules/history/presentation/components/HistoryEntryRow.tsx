import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from '@/shared/components'
import {
  ArrowUpCircle,
  CheckCircle2,
  Sparkles,
  XCircle,
  type LucideIcon,
} from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { formatRelativeTime } from '@/shared/utils/date'
import type { HistoryEntry } from '../../domain/history.types'

const ICON_BY_TYPE: Record<HistoryEntry['type'], { Icon: LucideIcon; color: string }> = {
  QUEST_COMPLETED: { Icon: CheckCircle2, color: colors.success },
  QUEST_FAILED: { Icon: XCircle, color: colors.danger },
  QUEST_EXPIRED: { Icon: XCircle, color: colors.danger },
  LEVEL_UP: { Icon: ArrowUpCircle, color: colors.legendary },
  ATTRIBUTE_POINTS_GRANTED: { Icon: Sparkles, color: colors.primary },
  ATTRIBUTE_POINT_ALLOCATED: { Icon: Sparkles, color: colors.primary },
}

function useHistoryMessage(entry: HistoryEntry): string {
  const { t } = useTranslation()

  switch (entry.type) {
    case 'QUEST_COMPLETED':
      return t('history.entryTypes.questCompleted', { title: entry.payload.questTitle })
    case 'QUEST_FAILED':
      return t('history.entryTypes.questFailed', { title: entry.payload.questTitle })
    case 'QUEST_EXPIRED':
      return t('history.entryTypes.questExpired', { title: entry.payload.questTitle })
    case 'LEVEL_UP':
      return t('history.entryTypes.levelUp', { level: entry.payload.level })
    case 'ATTRIBUTE_POINTS_GRANTED':
      return t('history.entryTypes.attributePointsGranted', { count: entry.payload.points })
    case 'ATTRIBUTE_POINT_ALLOCATED':
      return t('history.entryTypes.attributeAllocated', {
        count: entry.payload.amount,
        attribute: t(`character.stats.${entry.payload.attribute}`),
      })
  }
}

export function HistoryEntryRow({ entry }: { entry: HistoryEntry }) {
  const { i18n } = useTranslation()
  const { Icon, color } = ICON_BY_TYPE[entry.type]
  const message = useHistoryMessage(entry)

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface/60 p-3.5">
      <Icon size={20} color={color} />
      <View className="flex-1">
        <Text className="text-sm text-content">{message}</Text>
        <Text className="mt-0.5 text-[11px] text-content-muted">
          {formatRelativeTime(entry.createdAt, i18n.language)}
        </Text>
      </View>
    </View>
  )
}
