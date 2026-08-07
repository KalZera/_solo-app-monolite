import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Avatar, Badge, Panel, Text } from '@/shared/components'
import { Camera } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import type { CharacterProfile } from '../../domain/character.types'

export function ProfileHeader({ profile }: { profile: CharacterProfile | null }) {
  const { t } = useTranslation()
  const router = useRouter()
  const name = profile?.name ?? t('profile.defaultName')

  return (
    <Panel className="items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('profile.editAvatar')}
        onPress={() => router.push('/profile/avatar')}
        className="relative"
      >
        <Avatar uri={profile?.avatar} name={name} size={112} />
        <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border border-line bg-surface">
          <Camera size={16} color={colors.primary} />
        </View>
      </Pressable>

      <Text weight="bold" className="text-2xl text-content">
        {name}
      </Text>

      <View className="flex-row gap-2">
        {profile?.rank ? (
          <Badge label={`${t('dashboard.rank')} ${profile.rank}`} tone="legendary" />
        ) : null}
        {typeof profile?.level === 'number' ? (
          <Badge label={`${t('dashboard.level')} ${profile.level}`} tone="primary" />
        ) : null}
      </View>

      <Text className="text-xs text-content-muted">{t('profile.avatarHint')}</Text>
    </Panel>
  )
}
