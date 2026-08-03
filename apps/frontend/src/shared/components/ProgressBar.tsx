import { YStack } from "tamagui";
import type { ColorTokens } from "tamagui";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: ColorTokens | string;
  trackColor?: ColorTokens | string;
  height?: number;
}

export function ProgressBar({
  value,
  max,
  color = "$soloPurple",
  trackColor = "$soloPanelAlt",
  height = 6,
}: ProgressBarProps) {
  const fillPercent = max > 0 ? Math.min(Math.max(value / max, 0), 1) * 100 : 0;

  return (
    <YStack
      flex={1}
      height={height}
      borderRadius="$10"
      backgroundColor={trackColor}
      overflow="hidden"
    >
      <YStack
        height="100%"
        width={`${fillPercent}%`}
        backgroundColor={color}
        borderRadius="$10"
      />
    </YStack>
  );
}
