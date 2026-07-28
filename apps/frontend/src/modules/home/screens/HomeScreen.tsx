import { Bell } from "@tamagui/lucide-icons-2";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, XStack, YStack } from "tamagui";
import {
  isCharacterNotFound,
  useCharacterProfile,
} from "@/modules/character/api/useCharacterProfile";
import { CreateCharacterForm } from "@/modules/character/components/CreateCharacterForm";
import { useDailyQuests } from "@/modules/quest/api/useDailyQuests";
import { LoadingIndicator } from "@/shared/components/LoadingIndicator";
import { SystemPanel } from "@/shared/components/SystemPanel";
import { AttributesPanel } from "../components/AttributesPanel";
import { DailyMissionsPanel } from "../components/DailyMissionsPanel";
import { HeroCard } from "../components/HeroCard";

export function HomeScreen() {
  const { t } = useTranslation();
  const {
    data: character,
    isPending: isCharacterPending,
    isError,
    error,
  } = useCharacterProfile();
  const { data: quests, isPending: isQuestsPending } = useDailyQuests({
    enabled: Boolean(character),
  });

  if (isCharacterPending) {
    return <LoadingIndicator label={t("home.loadingSystem")} />;
  }

  if (isCharacterNotFound(error)) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        backgroundColor="$soloBg"
      >
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$5"
        >
          <SystemPanel width="100%" maxWidth={420}>
            <CreateCharacterForm />
          </SystemPanel>
        </YStack>
      </ScrollView>
    );
  }

  if (isError) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$soloBg"
        padding="$5"
      >
        <Text color="$soloDanger" textAlign="center">
          {t("home.failed")}
        </Text>
      </YStack>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      backgroundColor="$soloBg"
    >
      <YStack flex={1} padding="$4" paddingTop="$7" gap="$4">
        <XStack width="100%" justifyContent="flex-end" alignItems="center">
          <YStack>
            <Bell color="$soloText" size={24} />
            <YStack
              position="absolute"
              top={-2}
              right={-2}
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor="$soloDanger"
            />
          </YStack>
        </XStack>

        {character && <HeroCard character={character} />}
        {character && (
          <AttributesPanel
            stats={character.stats}
            availablePoints={character.restPoints}
          />
        )}
        {isQuestsPending && <LoadingIndicator label={t("home.loadingMissions")} />}
        {quests && <DailyMissionsPanel quests={quests} />}
      </YStack>
    </ScrollView>
  );
}
