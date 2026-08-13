import { Redirect, Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { FullScreenLoading } from '@/shared/components'
import { isApiError } from '@/shared/api/api-error'
import { useCharacterProfile } from '@/modules/profile/application/useCharacterProfile'
import { TutorialGate } from '@/modules/tutorial/presentation/TutorialGate'
import {
  CircleUser,
  Gauge,
  History,
  LayoutDashboard,
  ScrollText,
  User,
} from '@/shared/components/icons'
import { colors } from '@/shared/theme/colors'

export default function TabsLayout() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useCharacterProfile()

  // No character yet (backend returns 404) → send the Hunter through onboarding.
  // Other errors (offline, 5xx) fall through so the tabs stay reachable.
  if (isLoading) return <FullScreenLoading />
  if (!data && isApiError(error) && error.status === 404) {
    return <Redirect href="/onboarding" />
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.contentMuted,
          tabBarStyle: {
            backgroundColor: colors.surface.base,
            borderTopColor: colors.line,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 11 },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: t('tabs.dashboard'),
            tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="dash"
          options={{
            title: t('tabs.dash'),
            tabBarIcon: ({ color, size }) => <Gauge color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="character"
          options={{
            title: t('tabs.character'),
            tabBarIcon: ({ color, size }) => <CircleUser color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="quests"
          options={{
            title: t('tabs.quests'),
            tabBarIcon: ({ color, size }) => <ScrollText color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: t('tabs.history'),
            tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tabs>
      <TutorialGate />
    </>
  )
}
