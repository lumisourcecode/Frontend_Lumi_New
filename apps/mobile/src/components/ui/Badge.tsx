import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/Text";

type Props = ViewProps & {
  tone?: "default" | "pending" | "certified" | "danger";
  label: string;
};

export function Badge({ tone = "default", label, className, ...props }: Props) {
  return (
    <View
      className={cn(
        "rounded-full px-3 py-1",
        tone === "default" && "bg-slate-100",
        tone === "pending" && "bg-amber-100",
        tone === "certified" && "bg-emerald-100",
        tone === "danger" && "bg-rose-100",
        className as string,
      )}
      {...props}
    >
      <Text
        className={cn(
          "text-[12px] font-semibold",
          tone === "default" && "text-slate-700",
          tone === "pending" && "text-amber-800",
          tone === "certified" && "text-emerald-800",
          tone === "danger" && "text-rose-800",
        )}
      >
        {label}
      </Text>
    </View>
  );
}

