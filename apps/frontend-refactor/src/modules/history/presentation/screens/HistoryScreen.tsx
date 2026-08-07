import { FlatList, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  Button,
  EmptyState,
  Loading,
  Screen,
  ScreenHeader,
  SystemNotice,
} from '@/shared/components'
import { History } from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'
import { getErrorMessage } from '@/shared/api/api-error'
import { useCharacterHistory } from '../../application/useCharacterHistory'
import { HistoryEntryRow } from '../components/HistoryEntryRow'

export function HistoryScreen() {
  const { t } = useTranslation()
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCharacterHistory()

  const entries = (data?.pages ?? []).flatMap((page) => page.data)

  function renderBody() {
    if (isLoading) return <Loading label={t('history.loading')} />
    if (isError) {
      return (
        <View className="gap-4">
          <SystemNotice variant="error" message={getErrorMessage(error)} />
          <Button label={t('common.retry')} variant="secondary" onPress={() => refetch()} />
        </View>
      )
    }
    if (entries.length === 0) {
      return (
        <EmptyState
          icon={<History size={40} color={colors.contentMuted} />}
          title={t('history.empty')}
        />
      )
    }
    return (
      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        renderItem={({ item }) => <HistoryEntryRow entry={item} />}
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage()
        }}
        ListFooterComponent={isFetchingNextPage ? <Loading /> : null}
      />
    )
  }

  return (
    <Screen>
      <ScreenHeader
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        eyebrow={t('common.systemLabel')}
      />
      {renderBody()}
    </Screen>
  )
}
