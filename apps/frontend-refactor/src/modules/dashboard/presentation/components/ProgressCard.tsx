import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ProgressBar, Text } from '@/shared/components'
import { calculateXpToNextLevel } from '@/modules/profile/domain/xp'

export function ProgressCard({ level, experience }: { level: number; experience: number }) {
  const { t } = useTranslation()
  const max = calculateXpToNextLevel(level)

  return (
    <View className="rounded-xl border border-line bg-surface px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-[11px] uppercase tracking-wider text-content-muted">
            {t('dashboard.dash.level')}
          </Text>
          <Text weight="bold" className="text-xl text-primary">
            {level}
          </Text>
        </View>
        <Text className="text-[11px] text-content-muted">
          {t('character.screen.xp', {
            current: experience.toLocaleString(),
            max: max.toLocaleString(),
          })}
        </Text>
      </View>
      <ProgressBar value={experience} max={max} className="mt-2" />
    </View>
  )
}
