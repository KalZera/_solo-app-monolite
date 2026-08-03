import { Check, ChevronDown } from "@tamagui/lucide-icons-2";
import { Adapt, Select, Sheet } from "tamagui";

export interface SystemSelectOption<T extends string> {
  label: string;
  value: T;
}

interface SystemSelectProps<T extends string> {
  value?: T;
  onValueChange: (value: T) => void;
  options: readonly SystemSelectOption<T>[];
  placeholder?: string;
}

export function SystemSelect<T extends string>({
  value,
  onValueChange,
  options,
  placeholder,
}: SystemSelectProps<T>) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disablePreventBodyScroll
    >
      <Select.Trigger
        backgroundColor="$soloPanelAlt"
        borderColor="$soloBorder"
        borderWidth={1}
        borderRadius="$4"
        height={48}
        paddingHorizontal="$3"
        iconAfter={<ChevronDown color="$soloTextMuted" size={16} />}
      >
        <Select.Value placeholder={placeholder} color="$soloText" />
      </Select.Trigger>

      <Adapt platform="touch">
        <Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
          <Sheet.Frame backgroundColor="$soloPanel">
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Select.Content>
        <Select.Viewport
          backgroundColor="$soloPanel"
          borderColor="$soloBorder"
          borderWidth={1}
          minWidth={200}
        >
          <Select.Group>
            {options.map((option, index) => (
              <Select.Item
                index={index}
                key={option.value}
                value={option.value}
              >
                <Select.ItemText color="$soloText">
                  {option.label}
                </Select.ItemText>
                <Select.ItemIndicator marginLeft="auto">
                  <Check size={16} color="$soloCyan" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}
