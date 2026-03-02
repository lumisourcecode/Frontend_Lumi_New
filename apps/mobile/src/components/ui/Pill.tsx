import { Pressable, type PressableProps } from "react-native";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/Text";

type Props = PressableProps & {
  on: boolean;
  label: string;
};

export function Pill({ on, label, className, ...props }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "min-h-[40px] flex-row items-center justify-center rounded-full border px-4",
        on ? "border-indigo-950 bg-indigo-950" : "border-slate-300 bg-white",
        className as string,
      )}
      {...props}
    >
      <Text className={cn("text-[13px] font-semibold", on ? "text-white" : "text-slate-900")}>{label}</Text>
    </Pressable>
  );
}

