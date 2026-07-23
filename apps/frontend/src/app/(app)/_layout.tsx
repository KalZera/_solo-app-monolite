import { BarChart3, Backpack, Home, ScrollText, User } from '@tamagui/lucide-icons-2'
import { Tabs } from 'expo-router/js-tabs'
import { soloColors } from '@/shared/theme/tamagui.config'

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: soloColors.soloCyan,
        tabBarInactiveTintColor: soloColors.soloTextMuted,
        tabBarStyle: {
          backgroundColor: soloColors.soloPanel,
          borderTopColor: soloColors.soloBorder,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: 'Quests',
          tabBarIcon: ({ color, size }) => <ScrollText color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => <Backpack color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color as string} size={size} />,
        }}
      />
    </Tabs>
  )
}
