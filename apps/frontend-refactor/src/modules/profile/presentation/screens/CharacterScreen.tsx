import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  Button,
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
import { StatusView } from '../components/StatusView'
import { Section } from '@/shared/components/Section'
import { AttributeBars } from '../components/AttributeBars'
import { CircleCheckBig, Plus, User } from 'lucide-react-native'
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
    {
      label: t('character.screen.titleLabel'),
      value: data.title?.trim() ? data.title : t('character.screen.noTitle'),
    },
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
        </View>

        <View className="h-px bg-line" />

        <View className="gap-5 pt-4">
          <CharacterIdentity profile={data} />

          <Section
            title={t('character.screen.information')}
            icon={<User color={colors.primaryHover} size={16} />}
            className="text-primary-hover font-semibold"
          >
            <CharacterInfoPanel rows={infoRows} />
          </Section>

          {/* <Section
            title={t('character.screen.titleLabel')}
            icon={<User color={colors.primaryHover} size={16} />}
            className="text-primary-hover font-semibold"
          >
            <Text weight="medium" className="pl-2 text-sm text-content">
              {data.title?.trim() ? data.title : t('character.screen.noTitle')}
            </Text>
          </Section> */}
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
        {/* <Panel> */}
        <Button
          icon={<Plus size={20} color={colors.primary} />}
          label={'Distribuir Pontos Extras'}
          classNameLabel={`text-[${colors.success}]`}
        />
        {/* </Panel> */}
        <StatusBar />
      </SystemCard>
    </Screen>
  )
}
