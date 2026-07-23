import { QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider } from 'tamagui'
import { queryClient } from '@/shared/api/query-client'
import tamaguiConfig from '@/shared/theme/tamagui.config'

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#05070f' },
          }}
        />
      </QueryClientProvider>
    </TamaguiProvider>
  )
}
