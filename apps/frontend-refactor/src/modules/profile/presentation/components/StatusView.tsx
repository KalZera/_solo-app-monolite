import { Image, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LinearGradient } from 'expo-linear-gradient'
import { FrameCorners, ProgressBar, Text } from '@/shared/components'
import { LayoutGrid, Menu, User } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { calculateXpToNextLevel } from '../../domain/xp'
import type { CharacterProfile } from '../../domain/character.types'
import { AttributeBars } from './AttributeBars'

/** STATUS card: character portrait with an identity overlay, power and attribute bars. */
export function StatusView({ profile }: { profile: CharacterProfile }) {
  const { t } = useTranslation()
  const level = profile.level ?? 1
  const xp = profile.experience ?? 0
  const xpMax = calculateXpToNextLevel(level)

  return (
    <View className="relative overflow-hidden rounded-2xl border border-line bg-surface/40">
      <View className="flex-row items-center justify-center px-4 pb-2 pt-3">
        <Text weight="bold" className="text-base uppercase tracking-[6px] text-content">
          {t('character.status.title')}
        </Text>
      </View>
      <View className="h-px bg-line" />

      <View className="relative h-64 bg-surface-raised">
        <View className="flex-1 items-center justify-center">
          <User size={80} color={colors.line} />
        </View>
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(11,23,32,0.94)']}
          locations={[0, 0.35, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute right-4 top-6 items-end">
          <Text
            weight="bold"
            className="text-lg text-content"
            style={{ textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 }}
          >
            {profile.name}
          </Text>
          <Text className="mt-3 text-[10px] uppercase tracking-[2px] text-content-muted">
            {t('character.screen.level')}
          </Text>
          <Text weight="bold" className="text-4xl text-primary">
            {level}
          </Text>
          <ProgressBar value={xp} max={xpMax} className="mt-2 w-36" />
          <Text className="mt-1 text-[10px] text-content-muted">
            {t('character.screen.xp', {
              current: xp.toLocaleString(),
              max: xpMax.toLocaleString(),
            })}
          </Text>
        </View>
      </View>

      <View className="gap-4 p-4">
        <View>
          <Text className="text-[11px] uppercase tracking-[2px] text-content-muted">
            {t('character.status.power')}
          </Text>
          <Text weight="bold" className="text-3xl text-content">
            {(profile.powerScore ?? 0).toLocaleString()}
          </Text>
        </View>
        <AttributeBars stats={profile.stats} />
      </View>

      <FrameCorners />
    </View>
  )
}
