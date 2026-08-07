import { create } from 'zustand'

export type NotificationVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  variant: NotificationVariant
  title: string
  message?: string
  duration: number
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
  clear: () => void
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push(toast) {
    const id = createId()
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    if (toast.duration > 0) {
      timers.set(
        id,
        setTimeout(() => get().dismiss(id), toast.duration),
      )
    }
    return id
  },
  dismiss(id) {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
  },
  clear() {
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
    set({ toasts: [] })
  },
}))
