import { Check } from "@tamagui/lucide-icons-2";
import { Text, XStack, YStack } from "tamagui";
import { ProgressBar } from "@/shared/components/ProgressBar";
import type { Quest } from "@/modules/quest/types";

interface MissionRowProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  quest: Quest;
}

export function MissionRow({ icon: Icon, quest }: MissionRowProps) {
  const objective = quest.objectives[0];
  const isCompleted = quest.status === "completed";

  return (
    <XStack alignItems="center" gap="$3">
      <YStack
        width={40}
        height={40}
        borderRadius="$4"
        backgroundColor="$soloPanelAlt"
        alignItems="center"
        justifyContent="center"
      >
        <Icon color="$soloPurpleGlow" size={18} />
      </YStack>

      <YStack flex={1} gap="$1.5">
        <Text color="$soloText" fontSize="$3" fontWeight="600">
          {quest.title}
        </Text>
        {objective && (
          <XStack alignItems="center" gap="$2">
            <ProgressBar
              value={objective.current}
              max={objective.target}
              color="$soloPurple"
            />
            <Text color="$soloTextMuted" fontSize="$1">
              {objective.current}/{objective.target}
            </Text>
          </XStack>
        )}
      </YStack>

      {isCompleted ? (
        <Check color="$soloPurple" size={20} />
      ) : (
        <Text color="$soloPurple" fontSize="$3" fontWeight="700">
          XP {quest.rewardXp}
        </Text>
      )}
    </XStack>
  );
}
