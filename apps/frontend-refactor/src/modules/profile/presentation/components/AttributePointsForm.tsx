import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Button, Text } from '@/shared/components'
import {
  Brain,
  ChevronsRight,
  Dumbbell,
  Heart,
  Minus,
  Plus,
  Star,
  Wind,
  type LucideIcon,
} from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { useAllocateAttributePoints } from '../../application/useAllocateAttributePoints'
import type { CharacterStats, StatKey } from '../../domain/character.types'

// Same order/icons as AttributeBars, so the two lists read as the same attribute set.
const DISPLAY_ORDER: StatKey[] = ['strength', 'agility', 'vitality', 'intelligence', 'luck']

const statIcon: Record<StatKey, LucideIcon> = {
  strength: Dumbbell,
  agility: Wind,
  vitality: Heart,
  intelligence: Brain,
  luck: Star,
}

const EMPTY_ALLOCATIONS: Record<StatKey, number> = {
  strength: 0,
  intelligence: 0,
  agility: 0,
  vitality: 0,
  luck: 0,
}

interface AttributePointsFormProps {
  stats?: CharacterStats
  available: number
  /** Called after the points are successfully applied (e.g. to collapse the surrounding section). */
  onApplied?: () => void
}

/** List of attributes (mirrors AttributeBars) with a +/- counter per row and one submit button
 * that spends the distributed rest points in a single confirm action. */
export function AttributePointsForm({ stats, available, onApplied }: AttributePointsFormProps) {
  const { t } = useTranslation()
  const allocate = useAllocateAttributePoints()
  const [allocations, setAllocations] = useState<Record<StatKey, number>>(EMPTY_ALLOCATIONS)

  const totalAllocated = useMemo(
    () => Object.values(allocations).reduce((sum, amount) => sum + amount, 0),
    [allocations],
  )
  const remaining = available - totalAllocated

  function increment(key: StatKey) {
    if (remaining <= 0) return
    setAllocations((current) => ({ ...current, [key]: current[key] + 1 }))
  }

  function decrement(key: StatKey) {
    if (allocations[key] <= 0) return
    setAllocations((current) => ({ ...current, [key]: current[key] - 1 }))
  }

  function onSubmit() {
    if (totalAllocated === 0) return

    allocate.mutate(allocations, {
      onSuccess: () => {
        setAllocations(EMPTY_ALLOCATIONS)
        onApplied?.()
      },
    })
  }

  return (
    <View className="gap-3">
      <View className="gap-2.5">
        {DISPLAY_ORDER.map((key) => {
          const Icon = statIcon[key]
          const base = stats?.[key] ?? 0
          const pending = allocations[key]

          return (
            <View key={key} className="flex-row items-center gap-3">
              <Icon size={16} color={colors.primary} />
              <Text
                numberOfLines={1}
                className="w-24 text-[11px] uppercase tracking-wide text-content-muted"
              >
                {t(`character.stats.${key}`)}
              </Text>
              <Text weight="bold" className="text-sm text-content flex gap-2">
                {base}
                {pending > 0 ? (
                  <Text weight="bold" className="text-sm text-success">
                    {' '}
                    +{pending}
                  </Text>
                ) : null}
                <ChevronsRight size={16} color={colors.primary} />
                {base + pending}
              </Text>
              <View className="flex-1" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="-1"
                disabled={pending <= 0}
                onPress={() => decrement(key)}
                className="h-8 w-8 items-center justify-center rounded-lg border border-line disabled:opacity-40"
              >
                <Minus size={14} color={colors.primary} />
              </Pressable>
              {/* <Text weight="semibold" className="w-5 text-center text-sm text-content">
                {pending}
              </Text> */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="+1"
                disabled={remaining <= 0}
                onPress={() => increment(key)}
                className="h-8 w-8 items-center justify-center rounded-lg border border-line disabled:opacity-40"
              >
                <Plus size={14} color={colors.primary} />
              </Pressable>
            </View>
          )
        })}
      </View>

      <View className="flex-row items-center justify-between rounded-lg border border-line bg-surface/60 px-3 py-2">
        <Text className="text-xs uppercase tracking-wide text-content-muted">
          {t('character.attributes.remaining')}
        </Text>
        <Text weight="bold" className="text-sm text-primary">
          {remaining}
        </Text>
      </View>

      <Button
        icon={<Plus size={18} color={colors.primary} />}
        label={
          allocate.isPending ? t('character.attributes.saving') : t('character.attributes.save')
        }
        loading={allocate.isPending}
        disabled={totalAllocated === 0}
        onPress={onSubmit}
      />
    </View>
  )
}
