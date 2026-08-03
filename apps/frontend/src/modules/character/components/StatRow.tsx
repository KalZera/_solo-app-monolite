import { Text, XStack, YStack } from "tamagui";
import { ProgressBar } from "@/shared/components/ProgressBar";

const STAT_BAR_MAX = 500;

interface StatRowProps {
  label: string;
  value: number;
}

export function StatRow({ label, value }: StatRowProps) {
  return (
    <YStack gap="$1.5">
      <XStack justifyContent="space-between">
        <Text
          color="$soloTextMuted"
          fontSize="$3"
          letterSpacing={1}
          textTransform="uppercase"
        >
          {label}
        </Text>
        <Text color="$soloText" fontSize="$3" fontWeight="700">
          {value}
        </Text>
      </XStack>
      <ProgressBar value={value} max={STAT_BAR_MAX} color="$soloBlue" />
    </YStack>
  );
}
