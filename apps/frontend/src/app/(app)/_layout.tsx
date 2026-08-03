import {
  BarChart3,
  Backpack,
  Home,
  ScrollText,
  User,
} from "@tamagui/lucide-icons-2";
import { Tabs } from "expo-router/js-tabs";
import { useTranslation } from "react-i18next";
import { soloColors } from "@/shared/theme/tamagui.config";

export default function AppTabsLayout() {
  const { t } = useTranslation();

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
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <Home color={color as string} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: t("tabs.quests"),
          tabBarIcon: ({ color, size }) => (
            <ScrollText color={color as string} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: t("tabs.status"),
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color as string} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: t("tabs.inventory"),
          tabBarIcon: ({ color, size }) => (
            <Backpack color={color as string} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <User color={color as string} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
