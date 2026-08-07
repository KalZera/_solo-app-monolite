import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Loading, Screen, ScreenHeader, SystemCard, SystemNotice, Text } from '@/shared/components'
import { ChevronRight } from '@/shared/components/icons'
import { getErrorMessage } from '@/shared/api/api-error'
import { colors } from '@/shared/theme/colors'
import { useCharacterProfile } from '../../application/useCharacterProfile'
import { CharacterIdentity } from '../components/CharacterIdentity'
import { CharacterInfoPanel } from '../components/CharacterInfoPanel'
import { StatusView } from '../components/StatusView'
import { Section } from '@/shared/components/Section'

// Stylised Hunter ID derived from the character UUID (e.g. "#SL-A1B2C3").
function formatHunterId(id: string): string {
  return `#SL-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
}

export function CharacterScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data, isLoading, isError, error, refetch } = useCharacterProfile()

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title={t('character.screen.title')} eyebrow={t('common.systemLabel')} />
        <Loading label={t('common.loading')} />
      </Screen>
    )
  }

  if (isError || !data) {
    return (
      <Screen>
        <ScreenHeader title={t('character.screen.title')} eyebrow={t('common.systemLabel')} />
        <View className="gap-4">
          <SystemNotice variant="error" message={getErrorMessage(error)} />
          <Text className="text-center text-primary" onPress={() => refetch()}>
            {t('common.retry')}
          </Text>
        </View>
      </Screen>
    )
  }

  const infoRows = [
    { label: t('character.screen.hunterId'), value: formatHunterId(data.id) },
    { label: t('character.screen.affiliation'), value: t('character.screen.affiliationNone') },
    { label: t('character.screen.ranking'), value: data.rank ?? '—' },
    { label: t('character.screen.powerScore'), value: (data.powerScore ?? 0).toLocaleString() },
  ]

  return (
    <Screen scroll>
      <SystemCard className="mt-2">
        <View className="flex-row items-center justify-center pb-3">
          <Text weight="bold" className="text-lg uppercase tracking-[6px] text-content">
            {t('character.screen.title')}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.editAvatar')}
            onPress={() => router.push('/profile/avatar')}
            className="absolute right-0 h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface/60 active:bg-surface"
          >
            <ChevronRight size={20} color={colors.primary} />
          </Pressable>
        </View>

        <View className="h-px bg-line" />

        <View className="gap-5 pt-4">
          <CharacterIdentity profile={data} />

          <View className="rounded-xl border border-line bg-black/15 px-3.5 py-3">
            <Text className="text-[11px] uppercase tracking-[2px] text-primary">
              {t('character.screen.titleLabel')}
            </Text>
            <Text weight="medium" className="mt-1 text-sm text-content">
              {data.title?.trim() ? data.title : t('character.screen.noTitle')}
            </Text>
          </View>
          <Section title={t('character.screen.information')}>
            <CharacterInfoPanel rows={infoRows} />
          </Section>
        </View>
      </SystemCard>

      <View className="mt-5">
        <StatusView profile={data} />
      </View>
    </Screen>
  )
}
