import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Avatar, ProgressBar, Text } from '@/shared/components'
import { calculateXpToNextLevel } from '../../domain/xp'
import type { CharacterProfile } from '../../domain/character.types'

export function CharacterIdentity({ profile }: { profile: CharacterProfile }) {
  const { t } = useTranslation()
  const level = profile.level ?? 1
  const xp = profile.experience ?? 0
  const xpMax = calculateXpToNextLevel(level)

  return (
    <View className="flex-row gap-4">
      <Avatar
        uri={profile.avatar}
        name={profile.name}
        size={72}
        className="rounded-full border-2 border-primary"
      />
      <View className="flex-1 justify-center">
        <Text weight="bold" className="text-xl text-content">
          {profile.name}
        </Text>
        <Text className="text-[11px] uppercase tracking-[2px] text-content-muted">
          {t('character.screen.hunter')}
        </Text>

        <View className="mt-2 flex-row items-baseline gap-2">
          <Text className="text-[11px] uppercase tracking-wider text-content-muted">
            {t('character.screen.level')}
          </Text>
          <Text weight="bold" className="text-lg text-primary">
            {level}
          </Text>
        </View>

        <ProgressBar value={xp} max={xpMax} className="mt-1.5" />
        <Text className="mt-1 text-[11px] text-content-muted">
          {t('character.screen.xp', { current: xp.toLocaleString(), max: xpMax.toLocaleString() })}
        </Text>
      </View>
    </View>
  )
}
