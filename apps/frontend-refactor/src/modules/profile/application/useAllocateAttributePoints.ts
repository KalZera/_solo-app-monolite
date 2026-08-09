import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { allocateAttributePoints } from '@/shared/progression/progression.requests'
import type { AllocatableAttribute } from '@/shared/progression/progression.types'
import { characterKeys } from './character.keys'

export type AttributeAllocationInput = Partial<Record<AllocatableAttribute, number>>

export function useAllocateAttributePoints() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { success, error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (allocations: AttributeAllocationInput) => allocateAttributePoints({ allocations }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: characterKeys.profile() })
      success(t('character.attributes.successTitle'), t('character.attributes.successMessage'))
    },
    onError: (error) => notifyError(t('character.attributes.errorTitle'), getErrorMessage(error)),
  })
}
