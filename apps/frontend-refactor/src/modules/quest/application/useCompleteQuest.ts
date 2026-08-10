import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { showLevelUp } from '@/shared/level-up/level-up.store'
import type { LevelUpStatChange } from '@/shared/level-up/level-up.types'
import { characterKeys } from '@/modules/profile/application/character.keys'
import { STAT_KEYS, type CharacterProfile } from '@/modules/profile/domain/character.types'
import { completeQuestInstance, type CompleteQuestResult } from '../infrastructure/quest.requests'
import { questKeys } from './quest.keys'
import { useRouter } from 'expo-router'

function buildStatChanges(
  previous: CharacterProfile | undefined,
  next: CompleteQuestResult['character'],
) {
  return STAT_KEYS.map<LevelUpStatChange>((key) => ({
    key,
    from: previous?.stats?.[key] ?? next.stats[key],
    to: next.stats[key],
  }))
}

export function useCompleteQuest(rewardXp: number) {
  const { t } = useTranslation()
    const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (instanceId: string) => completeQuestInstance(instanceId),
    onSuccess: (result) => {
      // Snapshot the character BEFORE invalidating so level-up deltas are accurate.
      const previous = queryClient.getQueryData<CharacterProfile>(characterKeys.profile())
      queryClient.invalidateQueries({ queryKey: questKeys.all })
      // Completing grants XP, so the character/profile is now stale too.
      queryClient.invalidateQueries({ queryKey: characterKeys.all })

      queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      if (result.character.level > (previous?.level ?? 0)) {
        showLevelUp({
          fromLevel: previous?.level ?? result.character.level - 1,
          toLevel: result.character.level,
          stats: buildStatChanges(previous, result.character),
        })
        return
      }
      router.push('/quests')
      success(
        t('quest.detail.completeSuccessTitle'),
        t('quest.detail.completeSuccessMessage', { xp: rewardXp }),
      )
    },
    onError: (error) => notifyError(t('quest.detail.completeErrorTitle'), getErrorMessage(error)),
  })
}
