import { useState } from 'react'
import { FlatList, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  Button,
  EmptyState,
  Loading,
  Screen,
  ScreenHeader,
  SegmentedTabs,
  SystemNotice,
  TabButton,
} from '@/shared/components'
import { Plus, ScrollText } from '@/shared/components/icons'
import { getErrorMessage } from '@/shared/api/api-error'
import { colors } from '@/shared/theme/colors'
import { type QuestTab } from '../../application/useFilteredQuests'
import { useQuests } from '../../application/useQuests'
import { QuestCard } from '../components/QuestCard'
import type { QuestInstance } from '../../domain/quest-instance.types'

const FILTERS: QuestTab[] = ['all', 'daily', 'weekly', 'history']

export function QuestListScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [filter, setFilter] = useState<QuestTab>('daily')
  const { data: quests, isLoading, isError, error, refetch, isRefetching } = useQuests()

  const createButton = (
    <TabButton
      label={t('quest.list.create')}
      icon={<Plus size={14} color={colors.primary} />}
      onPress={() => router.push('/quests/new')}
    />
  )

  function renderBody() {
    if (isLoading) return <Loading label={t('quest.list.loading')} />
    if (isError) {
      return (
        <View className="gap-4">
          <SystemNotice variant="error" message={getErrorMessage(error)} />
          <Button label={t('common.retry')} variant="secondary" onPress={() => refetch()} />
        </View>
      )
    }

    if (quests?.length === 0) {
      return (
        <EmptyState
          icon={<ScrollText size={40} color={colors.contentMuted} />}
          title={t('quest.list.empty')}
          action={createButton}
        />
      )
    }
    return (
      <FlatList
        data={quests}
        keyExtractor={(quest) => (quest.instance as QuestInstance).id}
        renderItem={({ item }) => (
          <QuestCard
            quest={item}
            instance={item.instance as QuestInstance}
            onPress={() =>
              router.push({
                pathname: '/quests/[id]',
                params: { id: item?.instance?.id as string },
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
      />
    )
  }

  return (
    <Screen>
      <ScreenHeader
        title={t('quest.list.title')}
        subtitle={t('quest.list.subtitle')}
        eyebrow={t('common.systemLabel')}
        right={createButton}
      />
      <View className="pb-4">
        <SegmentedTabs
          options={FILTERS.map((value) => ({ label: t(`quest.list.filters.${value}`), value }))}
          value={filter}
          onChange={setFilter}
        />
      </View>
      {renderBody()}
    </Screen>
  )
}
