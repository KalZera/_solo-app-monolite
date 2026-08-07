import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { createCharacter } from '../infrastructure/character.requests'
import type { CreateCharacterInput } from '../domain/character.types'
import { characterKeys } from './character.keys'

export function useCreateCharacter() {
  const { t } = useTranslation()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (input: CreateCharacterInput) => createCharacter(input),
    onSuccess: async () => {
      // Refresh the profile so the onboarding gate lets the Hunter into the tabs.
      await queryClient.invalidateQueries({ queryKey: characterKeys.all })
      success(t('character.create.successTitle'), t('character.create.successMessage'))
      router.replace('/dashboard')
    },
    onError: (error) => notifyError(t('character.create.errorTitle'), getErrorMessage(error)),
  })
}
