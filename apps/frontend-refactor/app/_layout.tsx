import '../global.css'
import '@/shared/i18n'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { FullScreenLoading } from '@/shared/components'
import { queryClient } from '@/shared/api/query-client'
import { LanguageProvider } from '@/shared/i18n/LanguageProvider'
import { ToastHost } from '@/shared/notifications/ToastHost'
import { LevelUpHost } from '@/shared/level-up/LevelUpHost'
import { appFonts } from '@/shared/theme/fonts'
import { colors } from '@/shared/theme/colors'
import { useSessionStore } from '@/modules/auth/application/session.store'
import { useNotificationSocket } from '@/modules/notification/application/useNotificationSocket'

SplashScreen.preventAutoHideAsync()

function RootNavigator() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const isLoading = useSessionStore((state) => state.isLoading)
  const bootstrap = useSessionStore((state) => state.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  useNotificationSocket()

  if (isLoading) return <FullScreenLoading />

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backdrop.bottom },
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts)

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync()
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <StatusBar style="light" />
          <RootNavigator />
          <ToastHost />
          <LevelUpHost />
        </LanguageProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
