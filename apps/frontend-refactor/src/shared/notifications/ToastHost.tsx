import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Toast } from '../components/Toast'
import { useToastStore } from './notification.store'

/** Renders the active toast stack pinned to the top of the screen. */
export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)
  const insets = useSafeAreaInsets()

  if (toasts.length === 0) return null

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 top-0 z-50 gap-2 px-4"
      style={{ paddingTop: insets.top + 8 }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </View>
  )
}
