import { useTranslation } from "react-i18next";
import { Check } from "@tamagui/lucide-icons-2";
import { Text, XStack, YStack } from "tamagui";
import { SystemButton } from "@/shared/components/SystemButton";
import type { QuestObjective } from "../types";

interface ObjectiveRowProps {
  objective: QuestObjective;
  canComplete: boolean;
  isCompleting: boolean;
  onComplete: () => void;
}

export function ObjectiveRow({
  objective,
  canComplete,
  isCompleting,
  onComplete,
}: ObjectiveRowProps) {
  const { t } = useTranslation();

  return (
    <XStack
      backgroundColor="$soloPanelAlt"
      borderColor="$soloBorder"
      borderWidth={1}
      borderRadius="$4"
      padding="$3"
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
    >
      <YStack flex={1} gap="$1">
        <Text
          color="$soloText"
          fontSize="$3"
          textDecorationLine={objective.completed ? "line-through" : "none"}
        >
          {objective.description}
        </Text>
        <Text color="$soloTextMuted" fontSize="$1">
          {objective.current}/{objective.target}
        </Text>
      </YStack>

      {objective.completed ? (
        <Check color="$soloSuccess" size={20} />
      ) : (
        canComplete && (
          <SystemButton size="$2" onPress={onComplete} disabled={isCompleting}>
            {isCompleting
              ? t("quest.detail.objectiveCompleting")
              : t("quest.detail.objectiveComplete")}
          </SystemButton>
        )
      )}
    </XStack>
  );
}
