import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from '@/shared/components'
import {
  ArrowUpCircle,
  CheckCircle2,
  History,
  Sparkles,
  XCircle,
  type LucideIcon,
} from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { formatRelativeTime } from '@/shared/utils/date'
import type { HistoryEntry } from '../../domain/history.types'

// Backend descriptions are fixed Portuguese strings; classify by keyword for the icon.
function iconFor(description: string): { Icon: LucideIcon; color: string } {
  const text = description.toLowerCase()
  if (text.includes('nível')) return { Icon: ArrowUpCircle, color: colors.legendary }
  if (text.includes('completada')) return { Icon: CheckCircle2, color: colors.success }
  if (text.includes('falhou') || text.includes('expirou'))
    return { Icon: XCircle, color: colors.danger }
  if (text.includes('atributo') || text.includes('adicionou')) {
    return { Icon: Sparkles, color: colors.primary }
  }
  return { Icon: History, color: colors.contentMuted }
}

export function HistoryEntryRow({ entry }: { entry: HistoryEntry }) {
  const { i18n } = useTranslation()
  const { Icon, color } = iconFor(entry.description)

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface/60 p-3.5">
      <Icon size={20} color={color} />
      <View className="flex-1">
        <Text className="text-sm text-content">{entry.description}</Text>
        <Text className="mt-0.5 text-[11px] text-content-muted">
          {formatRelativeTime(entry.createdAt, i18n.language)}
        </Text>
      </View>
    </View>
  )
}
