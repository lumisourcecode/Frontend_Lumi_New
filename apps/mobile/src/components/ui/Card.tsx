import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/cn";

type Props = ViewProps & {
  tone?: "default" | "brand" | "muted";
};

export function Card({ tone = "default", className, ...props }: Props) {
  return (
    <View
      className={cn(
        "rounded-2xl border p-4",
        tone === "default" && "border-slate-200 bg-white",
        tone === "muted" && "border-slate-200 bg-slate-50",
        tone === "brand" && "border-transparent bg-indigo-950",
        className as string,
      )}
      {...props}
    />
  );
}

