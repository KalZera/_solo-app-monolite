import { useTranslation } from "react-i18next";
import { Adapt, Dialog, Sheet, Text, YStack } from "tamagui";
import { SystemButton } from "@/shared/components/SystemButton";

// business_rules.md: every level grants 5 rest points to distribute among attributes.
const REST_POINTS_PER_LEVEL = 5;

interface LevelUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLevel: number;
  powerScore: number;
  levelsGained: number;
}

export function LevelUpDialog({
  open,
  onOpenChange,
  newLevel,
  powerScore,
  levelsGained,
}: LevelUpDialogProps) {
  const { t } = useTranslation();
  const pointsGranted = levelsGained * REST_POINTS_PER_LEVEL;

  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <Adapt platform="touch">
        <Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
          <Sheet.Frame backgroundColor="$soloPanel" padding="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          backgroundColor="rgba(5,7,15,0.85)"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          key="content"
          backgroundColor="$soloPanel"
          borderColor="$soloCyan"
          borderWidth={2}
          borderRadius="$8"
          padding="$6"
          gap="$4"
          maxWidth={360}
          width="90%"
        >
          <YStack alignItems="center" gap="$1">
            <Text
              color="$soloCyan"
              fontSize="$3"
              letterSpacing={4}
              textTransform="uppercase"
            >
              {t("character.levelUp.title")}
            </Text>
            <Text color="$soloText" fontSize={48} fontWeight="900">
              {newLevel}
            </Text>
            <Text color="$soloTextMuted" fontSize="$3">
              {t("character.levelUp.powerScore", { score: powerScore })}
            </Text>
          </YStack>

          <YStack
            backgroundColor="$soloPanelAlt"
            borderRadius="$5"
            padding="$4"
            alignItems="center"
            gap="$1"
          >
            <Text color="$soloPurpleGlow" fontSize="$8" fontWeight="800">
              +{pointsGranted}
            </Text>
            <Text color="$soloTextMuted" fontSize="$2" textAlign="center">
              {t("character.levelUp.pointsDescription")}
            </Text>
          </YStack>

          <Dialog.Close asChild>
            <SystemButton onPress={() => onOpenChange(false)}>
              {t("character.levelUp.continue")}
            </SystemButton>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
