import { Flame, PersonStanding, Sword } from "@tamagui/lucide-icons-2";
import { useTranslation } from "react-i18next";
import { Text, XStack, YStack } from "tamagui";
import type { Quest } from "@/modules/quest/types";
import { MissionRow } from "./MissionRow";

// Presentational only — the quest domain doesn't carry icon metadata yet, so mock
// missions are decorated by position until a real icon field exists server-side.
const MISSION_ICONS = [Sword, PersonStanding, Flame];

interface DailyMissionsPanelProps {
  quests: Quest[];
}

export function DailyMissionsPanel({ quests }: DailyMissionsPanelProps) {
  const { t } = useTranslation();
  const completedCount = quests.filter(
    (quest) => quest.status === "completed",
  ).length;

  return (
    <YStack
      width="100%"
      backgroundColor="$soloPanel"
      borderColor="$soloBorder"
      borderWidth={1}
      borderRadius="$6"
      padding="$4"
      gap="$4"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text
          color="$soloTextMuted"
          fontSize="$2"
          letterSpacing={2}
          textTransform="uppercase"
          fontWeight="700"
        >
          {t("home.dailyMissions")}
        </Text>
        <Text color="$soloTextMuted" fontSize="$2">
          {t("home.completedCount", {
            completed: completedCount,
            total: quests.length,
          })}
        </Text>
      </XStack>

      <YStack gap="$3">
        {quests.map((quest, index) => (
          <MissionRow
            key={quest.id}
            quest={quest}
            icon={MISSION_ICONS[index % MISSION_ICONS.length]}
          />
        ))}
      </YStack>
    </YStack>
  );
}
