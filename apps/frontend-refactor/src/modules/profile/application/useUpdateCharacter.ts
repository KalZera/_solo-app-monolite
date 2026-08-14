import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { updateCharacter } from '../infrastructure/character.requests'
import type { UpdateCharacterInput } from '../domain/character.types'
import { characterKeys } from './character.keys'

export function useUpdateCharacter() {
  const { t } = useTranslation()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (input: UpdateCharacterInput) => updateCharacter(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: characterKeys.all })
      success(t('character.edit.successTitle'), t('character.edit.successMessage'))
      router.back()
    },
    onError: (error) => notifyError(t('character.edit.errorTitle'), getErrorMessage(error)),
  })
}
