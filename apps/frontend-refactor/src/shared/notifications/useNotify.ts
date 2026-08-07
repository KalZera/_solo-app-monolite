import { useToastStore, type NotificationVariant } from './notification.store'

const DEFAULT_DURATION_MS = 4000

interface NotifyInput {
  title: string
  message?: string
  variant?: NotificationVariant
  duration?: number
}

/**
 * Imperative toast API. Prefer the semantic helpers (`success`, `error`, …).
 * Titles/messages are the caller's responsibility (already localized).
 */
export function useNotify() {
  const push = useToastStore((state) => state.push)
  const dismiss = useToastStore((state) => state.dismiss)

  function notify({
    title,
    message,
    variant = 'info',
    duration = DEFAULT_DURATION_MS,
  }: NotifyInput) {
    return push({ title, message, variant, duration })
  }

  return {
    notify,
    dismiss,
    success: (title: string, message?: string) => notify({ title, message, variant: 'success' }),
    error: (title: string, message?: string) => notify({ title, message, variant: 'error' }),
    info: (title: string, message?: string) => notify({ title, message, variant: 'info' }),
    warning: (title: string, message?: string) => notify({ title, message, variant: 'warning' }),
  }
}
