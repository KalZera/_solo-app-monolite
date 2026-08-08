import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Avatar, HexagonBadge, ProgressBar, Text } from '@/shared/components'
import type { CharacterProfile } from '../../domain/character.types'

export function CharacterIdentity({ profile }: { profile: CharacterProfile }) {
  const { t } = useTranslation()
  const level = profile.level ?? 1
  const xp = profile.experience ?? 0
  const xpMax = profile.progression.nextLevelXp

  return (
    <View className="flex-row gap-4">
      <Avatar
        uri={profile.avatar}
        name={profile.name}
        size={72}
        className="rounded-full border-2 border-primary"
      />
      <View className="flex-1 justify-center">
        <View className="flex flex-row justify-content">
          <View className="flex-1">
            <Text weight="bold" className="text-xl text-content uppercase">
              {profile.name}
            </Text>
            <Text className="text-[11px] uppercase tracking-[2px] text-content">
              {t('character.screen.hunter')}
            </Text>
          </View>
          <HexagonBadge value={profile.level} horizontal size={48} fontSize={30} />
        </View>
        <View className="mt-2 items-baseline gap-2">
          <ProgressBar value={100} max={200} tone={'primary'} />
          <Text className="text-[11px] uppercase tracking-wider text-content-muted">
            {t('character.screen.xp', {
              current: xp.toLocaleString(),
              max: xpMax.toLocaleString(),
            })}
          </Text>
        </View>
      </View>
    </View>
  )
}
