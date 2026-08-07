import { Pressable, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from '@/shared/components'
import { Check } from '@/shared/components/icons'
import { cn } from '@/shared/utils/cn'
import { colors } from '@/shared/theme/colors'
import type { QuestInstanceObjective } from '../../domain/quest-instance.types'

interface QuestObjectiveRowProps {
  objective: QuestInstanceObjective
  disabled?: boolean
  onComplete: () => void
}

export function QuestObjectiveRow({ objective, disabled, onComplete }: QuestObjectiveRowProps) {
  const { t } = useTranslation()

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface/60 p-3">
      <View className="flex-1">
        <Text
          weight="medium"
          className={cn(
            'text-sm',
            objective.completed ? 'text-content-muted line-through' : 'text-content',
          )}
        >
          {objective.description}
        </Text>
        <Text className="text-[11px] text-content-muted">
          {objective.current}/{objective.target}
        </Text>
      </View>

      {objective.completed ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-success/15">
          <Check size={16} color={colors.success} />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onComplete}
          className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40"
        >
          <Text weight="semibold" className="text-xs text-primary">
            {t('quest.detail.objectiveDone')}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
