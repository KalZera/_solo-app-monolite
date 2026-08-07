import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/shared/api/api-error'
import { useNotify } from '@/shared/notifications/useNotify'
import { uploadCharacterAvatar } from '../infrastructure/character.requests'
import { characterKeys } from './character.keys'

export function useUploadAvatar() {
  const { t } = useTranslation()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: notifyError } = useNotify()

  return useMutation({
    mutationFn: (imageUri: string) => uploadCharacterAvatar(imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: characterKeys.profile() })
      success(t('profile.avatar.successTitle'), t('profile.avatar.successMessage'))
      router.back()
    },
    onError: (error) => notifyError(t('profile.avatar.errorTitle'), getErrorMessage(error)),
  })
}
