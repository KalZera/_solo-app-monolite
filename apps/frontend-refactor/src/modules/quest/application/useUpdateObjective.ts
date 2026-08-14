import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import {
  updateQuestObjective,
  type UpdateQuestObjectiveInput,
} from '../infrastructure/quest.requests'
import type { QuestFullInstance } from '../domain/quest-instance.types'
import { questKeys } from './quest.keys'

export function useUpdateObjective() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (input: UpdateQuestObjectiveInput) => updateQuestObjective(input),
    // Patch the cached quest in place instead of invalidating. The backend returns the objectives
    // in an unstable order after an update (no ordering column on quest_instance_objectives), so a
    // refetch would visibly reshuffle the list. We keep the current on-screen order and swap only
    // each item's state, so completing an objective never moves it.
    onSuccess: (result) => {
      queryClient.setQueryData<QuestFullInstance>(questKeys.byId(result.instance.id), (old) => {
        if (!old) return old
        const updatedById = new Map(
          (result.instance.objectives ?? []).map((objective) => [objective.id, objective]),
        )
        return {
          ...old,
          ...result.instance,
          quest: old.quest,
          objectives: (old.objectives ?? []).map(
            (objective) => updatedById.get(objective.id) ?? objective,
          ),
        }
      })
    },
    onError: (error) => notifyError(t('quest.detail.objectiveErrorTitle'), getErrorMessage(error)),
  })
}
