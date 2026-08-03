import { styled, YStack } from "tamagui";

export const SystemPanel = styled(YStack, {
  backgroundColor: "$soloPanel",
  borderColor: "$soloBorderStrong",
  borderWidth: 1,
  borderRadius: "$6",
  padding: "$5",
  shadowColor: "$soloBlue",
  shadowOpacity: 0.35,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 0 },
});
