import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pencil, User } from "@tamagui/lucide-icons-2";
import { Image as RNImage } from "react-native";
import { Button, ScrollView, Text, View, XStack, YStack } from "tamagui";
import { LoadingIndicator } from "@/shared/components/LoadingIndicator";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { SystemButton } from "@/shared/components/SystemButton";
import { SystemPanel } from "@/shared/components/SystemPanel";
import { useCharacterProgress } from "@/modules/progression";
import {
  isCharacterNotFound,
  useCharacterProfile,
} from "../api/useCharacterProfile";
import { useCharacterHistory } from "../api/useCharacterHistory";
import { StatRow } from "../components/StatRow";
import { HistoryEntryRow } from "../components/HistoryEntryRow";

export function CharacterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: character, isPending, isError, error } = useCharacterProfile();
  // Analytical progression snapshot derived entirely from accumulated XP.
  const progress = useCharacterProgress(character?.experience ?? 0);
  const {
    data: historyPages,
    isPending: isHistoryPending,
    isError: isHistoryError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCharacterHistory(Boolean(character));
  const historyEntries = historyPages?.pages.flatMap((page) => page.data) ?? [];

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      backgroundColor="$soloBg"
    >
      <YStack
        flex={1}
        alignItems="center"
        padding="$5"
        paddingTop="$8"
        gap="$5"
      >
        <Text
          color="$soloCyan"
          fontSize="$3"
          letterSpacing={4}
          textTransform="uppercase"
        >
          {t("character.screen.statusWindow")}
        </Text>

        {isPending && (
          <LoadingIndicator label={t("character.screen.loading")} />
        )}

        {isCharacterNotFound(error) && (
          <Text color="$soloTextMuted" paddingTop="$8" textAlign="center">
            {t("character.screen.noHunter")}
          </Text>
        )}

        {isError && !isCharacterNotFound(error) && (
          <Text color="$soloDanger" paddingTop="$8">
            {t("character.screen.failed")}
          </Text>
        )}

        {character && (
          <>
            <SystemPanel width="100%" maxWidth={420} gap="$4">
              <YStack alignItems="center" gap="$3">
                <Button
                  unstyled
                  onPress={() => router.push("/status/avatar")}
                  accessibilityLabel={t("character.avatarEditor.editHint")}
                >
                  <View width={96} height={96} position="relative">
                    <View
                      width={96}
                      height={96}
                      borderRadius="$4"
                      borderWidth={2}
                      borderColor="$soloCyan"
                      overflow="hidden"
                      backgroundColor="$soloPanelAlt"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {character.avatar ? (
                        <RNImage
                          source={{ uri: character.avatar }}
                          style={{ width: 96, height: 96 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <User color="$soloTextMuted" size={40} />
                      )}
                    </View>
                    <View
                      position="absolute"
                      bottom={-4}
                      right={-4}
                      width={28}
                      height={28}
                      borderRadius={14}
                      borderWidth={1}
                      borderColor="$soloBorderStrong"
                      backgroundColor="$soloBlue"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Pencil color="$soloBg" size={14} />
                    </View>
                  </View>
                </Button>
              </YStack>

              <YStack alignItems="center" gap="$1">
                <Text
                  color="$soloText"
                  fontSize={28}
                  fontWeight="800"
                  textAlign="center"
                >
                  {character.name}
                </Text>
                <Text color="$soloTextMuted" fontSize="$3" textAlign="center">
                  {character.title} · {character.class.toUpperCase()}
                </Text>
              </YStack>

              <XStack
                justifyContent="space-around"
                borderTopWidth={1}
                borderColor="$soloBorder"
                paddingTop="$4"
              >
                <YStack alignItems="center" gap="$1">
                  <Text
                    color="$soloTextMuted"
                    fontSize="$2"
                    textTransform="uppercase"
                  >
                    {t("character.screen.level")}
                  </Text>
                  <Text color="$soloCyan" fontSize="$7" fontWeight="800">
                    {progress.level}
                  </Text>
                </YStack>
                <YStack alignItems="center" gap="$1">
                  <Text
                    color="$soloTextMuted"
                    fontSize="$2"
                    textTransform="uppercase"
                  >
                    {t("character.screen.rank")}
                  </Text>
                  <Text color="$soloCyan" fontSize="$7" fontWeight="800">
                    {character.rank}
                  </Text>
                </YStack>
                <YStack alignItems="center" gap="$1">
                  <Text
                    color="$soloTextMuted"
                    fontSize="$2"
                    textTransform="uppercase"
                  >
                    {t("character.screen.power")}
                  </Text>
                  <Text color="$soloCyan" fontSize="$7" fontWeight="800">
                    {character.powerScore}
                  </Text>
                </YStack>
              </XStack>

              <YStack gap="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text
                    color="$soloTextMuted"
                    fontSize="$2"
                    textTransform="uppercase"
                  >
                    {t("character.screen.experience")}
                  </Text>
                  <Text color="$soloTextMuted" fontSize="$2">
                    {progress.xpIntoCurrentLevel} /{" "}
                    {progress.xpIntoCurrentLevel + progress.xpRemaining} XP
                  </Text>
                </XStack>
                <ProgressBar
                  value={progress.xpIntoCurrentLevel}
                  max={progress.xpIntoCurrentLevel + progress.xpRemaining}
                  color="$soloCyan"
                />
                <XStack justifyContent="space-between" alignItems="center">
                  <Text color="$soloTextMuted" fontSize="$2">
                    {t("character.screen.toNextLevel", {
                      xp: progress.xpRemaining,
                    })}
                  </Text>
                  <Text color="$soloTextMuted" fontSize="$2">
                    {progress.progress}%
                  </Text>
                </XStack>
              </YStack>
            </SystemPanel>

            <SystemPanel width="100%" maxWidth={420} gap="$4">
              <Text color="$soloText" fontSize="$5" fontWeight="700">
                {t("character.screen.attributes")}
              </Text>
              <StatRow
                label={t("character.screen.stats.strength")}
                value={character.stats.strength}
              />
              <StatRow
                label={t("character.screen.stats.intelligence")}
                value={character.stats.intelligence}
              />
              <StatRow
                label={t("character.screen.stats.agility")}
                value={character.stats.agility}
              />
              <StatRow
                label={t("character.screen.stats.vitality")}
                value={character.stats.vitality}
              />
              <StatRow
                label={t("character.screen.stats.luck")}
                value={character.stats.luck}
              />
            </SystemPanel>

            <SystemPanel width="100%" maxWidth={420} gap="$4">
              <Text color="$soloText" fontSize="$5" fontWeight="700">
                {t("character.screen.history.title")}
              </Text>

              {isHistoryPending && (
                <LoadingIndicator
                  label={t("character.screen.history.loading")}
                />
              )}

              {isHistoryError && (
                <Text color="$soloDanger" fontSize="$2" textAlign="center">
                  {t("character.screen.history.failed")}
                </Text>
              )}

              {!isHistoryPending &&
                !isHistoryError &&
                historyEntries.length === 0 && (
                  <Text color="$soloTextMuted" fontSize="$2" textAlign="center">
                    {t("character.screen.history.empty")}
                  </Text>
                )}

              {historyEntries.length > 0 && (
                <YStack gap="$2">
                  {historyEntries.map((entry) => (
                    <HistoryEntryRow key={entry.id} entry={entry} />
                  ))}
                </YStack>
              )}

              {hasNextPage && (
                <SystemButton
                  onPress={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? t("character.screen.history.loadingMore")
                    : t("character.screen.history.loadMore")}
                </SystemButton>
              )}
            </SystemPanel>
          </>
        )}
      </YStack>
    </ScrollView>
  );
}
