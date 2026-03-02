import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cn } from "@/lib/cn";

type Props = RNTextProps & {
  tone?: "default" | "muted" | "title" | "subtitle" | "danger" | "success";
};

export function Text({ tone = "default", className, ...props }: Props) {
  return (
    <RNText
      className={cn(
        "text-[15px] leading-5",
        tone === "default" && "text-slate-900",
        tone === "muted" && "text-slate-500",
        tone === "title" && "text-[22px] font-bold text-slate-900",
        tone === "subtitle" && "text-[16px] font-semibold text-slate-900",
        tone === "danger" && "text-red-600",
        tone === "success" && "text-emerald-700",
        className as string,
      )}
      {...props}
    />
  );
}

