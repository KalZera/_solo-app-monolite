import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  Collapsable,
  HexagonBadge,
  Loading,
  Panel,
  Screen,
  ScreenHeader,
  SystemCard,
  SystemNotice,
  Text,
} from '@/shared/components'
import { getErrorMessage } from '@/shared/api/api-error'
import { useCharacterProfile } from '../../application/useCharacterProfile'
import { CharacterIdentity } from '../components/CharacterIdentity'
import { CharacterInfoPanel } from '../components/CharacterInfoPanel'
import { Section } from '@/shared/components/Section'
import { AttributeBars } from '../components/AttributeBars'
import { AttributePointsForm } from '../components/AttributePointsForm'
import { User } from 'lucide-react-native'
import { Pencil } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { StatusBar } from '../components/StatusBar'

// Stylised Hunter ID derived from the character UUID (e.g. "#SL-A1B2C3").
function formatHunterId(id: string): string {
  return `#SL-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
}

export function CharacterScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data, isLoading, isError, error, refetch } = useCharacterProfile()
  const [pointsOpen, setPointsOpen] = useState(false)

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
    { label: t('character.screen.class'), value: t(`character.classes.${data.class}`) },
    { label: t('character.screen.affiliation'), value: t('character.screen.hajinAffiliation') },
    {
      label: t('character.screen.titleLabel'),
      value: data.title?.trim() ? data.title : t('character.screen.noTitle'),
    },
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
        </View>

        <View className="h-px bg-line" />

        <View className="gap-5 pt-4">
          <CharacterIdentity profile={data} />

          <Section
            title={t('character.screen.information')}
            icon={<User color={colors.primaryHover} size={16} />}
            className="text-primary-hover font-semibold"
            action={
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/character/edit')}
                hitSlop={8}
                className="flex-row items-center gap-1 rounded border border-line px-2 py-1 active:bg-surface-raised"
              >
                <Pencil size={12} color={colors.primary} />
                <Text
                  weight="semibold"
                  className="text-[10px] uppercase tracking-[1px] text-primary"
                >
                  {t('character.screen.editInfo')}
                </Text>
              </Pressable>
            }
          >
            <CharacterInfoPanel rows={infoRows} />
          </Section>
        </View>

        <Panel className="mt-2 flex flex-row gap-2">
          <View className="flex flex-row gap-2">
            <View className="flex-1 rounded-lg px-3 py-2 border border-primary/60 bg-surface justify-center items-center">
              <Text className="text-xs uppercase tracking-wide text-primary-hover font-bold pb-2">
                {t(`character.screen.powerScore`)}
              </Text>
              <HexagonBadge value={data.level} size={90} fontSize={42} />
            </View>
          </View>
          <View className="flex-1">
            <AttributeBars stats={data.stats} />
          </View>
        </Panel>
        <Collapsable
          title={
            <View className="flex flex-1 flex-row justify-between">
              <Text
                weight="semibold"
                className="flex-1 text-sm uppercase tracking-wide text-warning"
              >
                Distribuir pontos
              </Text>
              <Text weight="semibold" className=" text-sm uppercase tracking-wide text-warning">
                {data.progression.attributePointsAvailable}
              </Text>
            </View>
          }
          open={pointsOpen}
          onOpenChange={setPointsOpen}
          className="mt-2"
        >
          <AttributePointsForm
            stats={data.stats}
            available={data.progression.attributePointsAvailable}
            onApplied={() => setPointsOpen(false)}
          />
        </Collapsable>
        <StatusBar />
      </SystemCard>
    </Screen>
  )
}
