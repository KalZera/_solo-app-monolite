import { useToastController } from '@tamagui/toast'
import type { ToastVariant } from './ToastProvider'

export function useAppToast() {
  const toast = useToastController()

  function notify(variant: ToastVariant, title: string, message?: string) {
    toast.show(title, { message, variant })
  }

  return {
    showSuccess: (title: string, message?: string) => notify('success', title, message),
    showError: (title: string, message?: string) => notify('error', title, message),
    showInfo: (title: string, message?: string) => notify('info', title, message),
  }
}
