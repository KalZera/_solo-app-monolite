import { Pressable, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ProgressBar, Text } from '@/shared/components'
import { Check, Minus, Plus } from '@/shared/components/icons'
import { cn } from '@/shared/utils/cn'
import { colors } from '@/shared/theme/colors'
import type { QuestInstanceObjective } from '../../domain/quest-instance.types'

interface QuestObjectiveRowProps {
  objective: QuestInstanceObjective
  disabled?: boolean
  onComplete: () => void
  onChangeCurrent: (current: number) => void
}

export function QuestObjectiveRow({
  objective,
  disabled,
  onComplete,
  onChangeCurrent,
}: QuestObjectiveRowProps) {
  const { t } = useTranslation()
  // A target of 1 is a plain done/not-done objective; above that it tracks a running count.
  const hasCounter = objective.target > 1

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
        {/* informativo de target */}
        <View className="flex-row items-center gap-2">
          <Text className="text-[11px] text-content-muted">
            {objective.current}/{objective.target}
          </Text>
          <ProgressBar
            value={objective.current}
            max={objective.target}
            tone={objective.completed ? 'success' : 'primary'}
            className="h-1.5 flex-1"
          />
        </View>
      </View>

      {objective.completed ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-success/15">
          <Check size={16} color={colors.success} />
        </View>
      ) : hasCounter ? (
        <View className="flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="-1"
            disabled={disabled || objective.current <= 0}
            onPress={() => onChangeCurrent(Math.max(objective.current - 1, 0))}
            className="h-8 w-8 items-center justify-center rounded-lg border border-line disabled:opacity-40"
          >
            <Minus size={14} color={colors.primary} />
          </Pressable>
          <Text weight="semibold" className="w-6 text-center text-sm text-content">
            {objective.current}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="+1"
            disabled={disabled || objective.current >= objective.target}
            onPress={() => onChangeCurrent(Math.min(objective.current + 1, objective.target))}
            className="h-8 w-8 items-center justify-center rounded-lg border border-line disabled:opacity-40"
          >
            <Plus size={14} color={colors.primary} />
          </Pressable>
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
