import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Text } from "@/components/ui/Text";

export function MapBackdrop({ subtitle }: { subtitle?: string }) {
  return (
    <View className="absolute inset-0">
      {/* Map placeholder with Uber-like dark overlay */}
      <LinearGradient
        colors={["#0B1026", "#111827", "#0B1026"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <View className="absolute inset-0 opacity-30">
        {/* faint grid */}
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={`h-${i}`} className="absolute left-0 right-0 h-px bg-white/10" style={{ top: i * 48 }} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: i * 48 }} />
        ))}
      </View>
      <View className="absolute left-5 top-16 right-5">
        <Text className="text-white text-[22px] font-bold">Lumi Ride</Text>
        <Text className="text-slate-200 mt-1">{subtitle ?? "Book accessible rides in seconds."}</Text>
      </View>
    </View>
  );
}

