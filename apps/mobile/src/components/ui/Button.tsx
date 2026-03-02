import { Pressable, type PressableProps } from "react-native";
import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/Text";

type Props = Omit<PressableProps, "children"> & {
  variant?: "primary" | "outline" | "danger";
  title?: string;
  children?: React.ReactNode;
};

export function Button({ variant = "primary", className, title, children, ...props }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        // 44px min touch target
        "min-h-[44px] flex-row items-center justify-center rounded-2xl px-4 py-3 active:opacity-90",
        variant === "primary" && "bg-indigo-950",
        variant === "outline" && "border border-slate-300 bg-white",
        variant === "danger" && "bg-red-600",
        className as string,
      )}
      {...props}
    >
      {typeof title === "string" ? (
        <Text
          className={cn(
            "font-semibold",
            variant === "primary" && "text-white",
            variant === "outline" && "text-slate-900",
            variant === "danger" && "text-white",
          )}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </Pressable>
  );
}

