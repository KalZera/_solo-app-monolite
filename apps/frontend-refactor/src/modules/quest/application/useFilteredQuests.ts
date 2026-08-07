import { useMemo } from 'react'
import type { QuestInstance } from '../domain/quest-instance.types'
import type { QuestTab } from '../infrastructure/quest.requests'
import { useQuests } from './useQuests'
import { useQuestsByTab } from './useQuestsByTab'

export type { QuestTab }

/**
 * Renders exactly what the backend returns for the selected tab
 * (GET /quests/today?tab=daily|weekly|history). No filtering happens here — this
 * hook only joins each instance with its quest template (title/description/rank/etc.,
 * which /today does not include) for display, preserving the backend's membership.
 */
export function useFilteredQuests(tab: QuestTab) {
  const questsQuery = useQuests()
  const instancesQuery = useQuestsByTab(tab)
  
  const templatesById = useMemo(
    () => new Map(questsQuery.data?.map((quest) => [quest.id, quest]) ?? []),
    [questsQuery.data],
  )

  const instanceByQuestId = useMemo(() => {
    const map = new Map<string, QuestInstance>()
    for (const instance of instancesQuery.data ?? []) map.set(instance.questId, instance)
    return map
  }, [instancesQuery.data])

  const quests = useMemo(
    () =>
      (instancesQuery.data ?? []).flatMap((instance) => {
        const quest = templatesById.get(instance.questId)
        return quest ? [quest] : []
      }),
    [instancesQuery.data, templatesById],
  )

  return {
    quests,
    instanceByQuestId,
    isLoading: questsQuery.isLoading || instancesQuery.isLoading,
    isError: questsQuery.isError || instancesQuery.isError,
    error: questsQuery.error ?? instancesQuery.error,
    isRefetching: questsQuery.isRefetching || instancesQuery.isRefetching,
    refetch: () => {
      void questsQuery.refetch()
      void instancesQuery.refetch()
    },
  }
}
