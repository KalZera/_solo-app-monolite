import { Stack } from 'expo-router'
import { colors } from '@/shared/theme/colors'

export default function QuestsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backdrop.bottom },
      }}
    />
  )
}
