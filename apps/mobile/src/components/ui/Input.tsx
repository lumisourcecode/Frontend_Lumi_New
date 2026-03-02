import { TextInput, type TextInputProps, View } from "react-native";
import { cn } from "@/lib/cn";

type Props = TextInputProps & {
  right?: React.ReactNode;
};

export function Input({ className, right, ...props }: Props) {
  return (
    <View className="flex-row items-center rounded-2xl border border-slate-300 bg-white px-3">
      <TextInput
        className={cn("min-h-[44px] flex-1 py-3 text-[15px] text-slate-900", className as string)}
        placeholderTextColor="#94A3B8"
        {...props}
      />
      {right}
    </View>
  );
}

