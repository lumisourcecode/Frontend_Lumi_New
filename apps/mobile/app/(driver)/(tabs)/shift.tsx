import { useMemo, useState } from "react";
import { Alert, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

export default function DriverShiftScreen() {
  const [clockInAt, setClockInAt] = useState<Date | null>(null);
  const [breakMinutes, setBreakMinutes] = useState(0);

  const duration = useMemo(() => {
    if (!clockInAt) return "—";
    const ms = Date.now() - clockInAt.getTime() - breakMinutes * 60_000;
    const safeMs = Math.max(0, ms);
    const h = Math.floor(safeMs / 3_600_000);
    const m = Math.floor((safeMs % 3_600_000) / 60_000);
    return `${h}h ${m}m`;
  }, [breakMinutes, clockInAt]);

  return (
    <Screen>
      <Text tone="title">Shift</Text>

      <Card className="mt-4">
        <Text tone="subtitle">Clock in/out</Text>
        <Text tone="muted" className="mt-2">
          Shift duration (minus breaks): {duration}
        </Text>

        <View className="mt-3 flex-row gap-2">
          <View className="flex-1">
            <Button
              title={clockInAt ? "Clocked in" : "Clock in"}
              disabled={!!clockInAt}
              onPress={() => setClockInAt(new Date())}
            />
          </View>
          <View className="flex-1">
            <Button
              variant="outline"
              title="Clock out"
              onPress={() => {
                if (!clockInAt) {
                  Alert.alert("Not clocked in", "Clock in first.");
                  return;
                }
                setClockInAt(null);
                setBreakMinutes(0);
                Alert.alert("Shift saved", "Shift tracking is local-only for now; we’ll store it in Supabase next.");
              }}
            />
          </View>
        </View>

        <View className="mt-3 flex-row gap-2">
          <View className="flex-1">
            <Button variant="outline" title="+10m break" onPress={() => setBreakMinutes((m) => m + 10)} />
          </View>
          <View className="flex-1">
            <Button variant="outline" title="Reset breaks" onPress={() => setBreakMinutes(0)} />
          </View>
        </View>
      </Card>

      <Card className="mt-4">
        <Text tone="subtitle">Availability</Text>
        <Text tone="muted" className="mt-2">
          Availability planner comes next (set weekly schedule, blackout times, and auto-conflict detection).
        </Text>
      </Card>
    </Screen>
  );
}

