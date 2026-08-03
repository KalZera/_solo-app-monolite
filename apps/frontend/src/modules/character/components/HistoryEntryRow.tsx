import { Text, YStack } from "tamagui";
import type { CharacterHistoryEntry } from "../types";

interface HistoryEntryRowProps {
  entry: CharacterHistoryEntry;
}

export function HistoryEntryRow({ entry }: HistoryEntryRowProps) {
  return (
    <YStack
      backgroundColor="$soloPanelAlt"
      borderColor="$soloBorder"
      borderWidth={1}
      borderRadius="$4"
      padding="$3"
      gap="$1"
    >
      <Text color="$soloText" fontSize="$3">
        {entry.description}
      </Text>
      <Text color="$soloTextMuted" fontSize="$1">
        {new Date(entry.createdAt).toLocaleString()}
      </Text>
    </YStack>
  );
}
