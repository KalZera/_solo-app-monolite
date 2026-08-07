import type { ReactNode } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Loading, Screen, SystemCard, SystemNotice, Text } from '@/shared/components'
import { LayoutGrid, Menu } from '@/shared/components/icons'
import { getErrorMessage } from '@/shared/api/api-error'
import { colors } from '@/shared/theme/colors'
import { useCharacterProfile } from '@/modules/profile/application/useCharacterProfile'
import { useDashSummary } from '../../application/useDashSummary'
import { SummaryCards } from '../components/SummaryCards'
import { ProgressCard } from '../components/ProgressCard'
import { AttributeRadar } from '../components/AttributeRadar'
import { Section } from '@/shared/components/Section'

const RADAR_ORDER = ['strength', 'agility', 'vitality', 'intelligence', 'luck'] as const

export function DashScreen() {
  const { t } = useTranslation()
  const profile = useCharacterProfile()
  const summary = useDashSummary()
  const character = profile.data

  const radarStats = RADAR_ORDER.map((key) => ({
    label: t(`character.stats.${key}`),
    value: character?.stats?.[key] ?? 0,
  }))

  const summaryStats = [
    {
      label: t('dashboard.dash.completedQuests'),
      value: (summary.data?.completedQuests ?? 0).toLocaleString(),
    },
    {
      label: t('dashboard.dash.streak'),
      value: (summary.data?.streakDays ?? 0).toLocaleString(),
      unit: t('dashboard.dash.streakUnit'),
    },
    {
      label: t('dashboard.dash.pointsToday'),
      value: (summary.data?.pointsToday ?? 0).toLocaleString(),
    },
  ]

  function renderBody() {
    if (profile.isLoading || summary.isLoading) return <Loading label={t('common.loading')} />
    if (profile.isError || !character) {
      return <SystemNotice variant="error" message={getErrorMessage(profile.error)} />
    }
    return (
      <>
        <Section title={t('dashboard.dash.summary')}>
          <SummaryCards stats={summaryStats} />
        </Section>
        <Section title={t('dashboard.dash.progress')}>
          <ProgressCard level={character.level ?? 1} experience={character.experience ?? 0} />
        </Section>
        <Section title={t('dashboard.dash.attributes')}>
          <AttributeRadar stats={radarStats} />
        </Section>
      </>
    )
  }

  return (
    <Screen scroll>
      <SystemCard className="mt-2 gap-5">
        <View className="flex-row items-center justify-center pb-3">
          <View className="absolute left-0">
            <LayoutGrid size={20} color={colors.contentMuted} />
          </View>
          <Text weight="bold" className="text-lg uppercase tracking-[6px] text-content">
            {t('dashboard.dash.title')}
          </Text>
          <View className="absolute right-0">
            <Menu size={20} color={colors.contentMuted} />
          </View>
        </View>
        <View className="h-px bg-line" />
        {renderBody()}
      </SystemCard>
    </Screen>
  )
}
