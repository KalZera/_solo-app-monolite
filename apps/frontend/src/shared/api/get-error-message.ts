import axios from 'axios'
import i18n from '@/shared/i18n'

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message
    if (message) return message
  }
  return i18n.t('common.failedToReachSystem')
}
