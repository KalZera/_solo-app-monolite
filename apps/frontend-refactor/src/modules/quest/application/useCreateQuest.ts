import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { createQuest } from '../infrastructure/quest.requests'
import type { CreateQuestPayload } from '../domain/quest.types'
import { questKeys } from './quest.keys'

export function useCreateQuest() {
  const { t } = useTranslation()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (payload: CreateQuestPayload) => createQuest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questKeys.all })
      success(t('quest.create.successTitle'), t('quest.create.successMessage'))
      router.back()
    },
    onError: (error) => notifyError(t('quest.create.errorTitle'), getErrorMessage(error)),
  })
}
