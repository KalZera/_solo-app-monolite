import { Stack } from 'expo-router'

export default function QuestsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#05070f' },
      }}
    />
  )
}
