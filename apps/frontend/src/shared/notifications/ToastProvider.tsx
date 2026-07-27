import type { ReactNode } from 'react'
import { Toast, ToastProvider, ToastViewport, useToastState } from '@tamagui/toast'
import { YStack } from 'tamagui'

export type ToastVariant = 'success' | 'error' | 'info'

declare module '@tamagui/toast' {
  interface CustomData {
    variant?: ToastVariant
  }
}

const VARIANT_COLOR: Record<ToastVariant, string> = {
  success: '$soloSuccess',
  error: '$soloDanger',
  info: '$soloCyan',
}

function CurrentToast() {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) {
    return null
  }

  const accentColor = VARIANT_COLOR[currentToast.variant ?? 'info']

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      viewportName={currentToast.viewportName}
      enterStyle={{ opacity: 0, scale: 0.9, y: -12 }}
      exitStyle={{ opacity: 0, scale: 0.9, y: -12 }}
      backgroundColor="$soloPanel"
      borderColor={accentColor}
      borderWidth={1.5}
      borderRadius="$6"
      padding="$3.5"
    >
      <YStack gap="$1">
        <Toast.Title color={accentColor} fontWeight="700" fontSize="$3">
          {currentToast.title}
        </Toast.Title>
        {!!currentToast.message && (
          <Toast.Description color="$soloTextMuted" fontSize="$2">
            {currentToast.message}
          </Toast.Description>
        )}
      </YStack>
    </Toast>
  )
}

export function AppToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider swipeDirection="horizontal" duration={4000} native={false}>
      {children}
      <CurrentToast />
      <ToastViewport top="$7" left={0} right={0} />
    </ToastProvider>
  )
}
