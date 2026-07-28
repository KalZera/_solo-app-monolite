import { QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider, View } from 'tamagui'
import { SessionProvider, useSession } from '@/modules/auth/session/SessionProvider'
import { queryClient } from '@/shared/api/query-client'
import { AppToastProvider } from '@/shared/notifications/ToastProvider'
import { PushNotificationsProvider } from '@/shared/notifications/PushNotificationsProvider'
import '@/shared/i18n'
import { LanguageProvider } from '@/shared/i18n/LanguageProvider'
import tamaguiConfig from '@/shared/theme/tamagui.config'

function RootNavigator() {
  const { isAuthenticated, isLoading } = useSession()

  if (isLoading) {
    return <View flex={1} backgroundColor="$soloBg" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#05070f' },
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <AppToastProvider>
              <PushNotificationsProvider>
                <StatusBar style="light" />
                <RootNavigator />
              </PushNotificationsProvider>
            </AppToastProvider>
          </SessionProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </TamaguiProvider>
  )
}
