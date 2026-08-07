import { Stack } from 'expo-router'
import { colors } from '@/shared/theme/colors'

export default function ProfileStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backdrop.bottom },
      }}
    />
  )
}
