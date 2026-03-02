import { RefreshControl, SafeAreaView, ScrollView, type ViewProps } from "react-native";
import { cn } from "@/lib/cn";

type Props = ViewProps & {
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({ scroll = true, className, children, refreshing, onRefresh, ...props }: Props) {
  if (!scroll) {
    return (
      <SafeAreaView className={cn("flex-1 bg-slate-50 px-4", className as string)} {...props}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn("flex-1 bg-slate-50", className as string)} {...props}>
      <ScrollView
        contentContainerClassName="px-4 py-4"
        refreshControl={
          typeof onRefresh === "function" ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

