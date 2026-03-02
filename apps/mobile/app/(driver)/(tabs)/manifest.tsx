import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Divider } from "@/components/ui/Divider";
import { MapBackdrop } from "@/components/ui/MapBackdrop";

type TripState = "assigned" | "arrived" | "picked_up" | "drop_off";

type TripRow = {
  id: string;
  state: TripState;
  eta: string | null;
  booking: {
    id: string;
    pickup: string;
    dropoff: string;
    scheduled_at: string;
    base_fare: number;
    mobility: any;
  } | null;
};

function nextState(state: TripState): TripState {
  if (state === "assigned") return "arrived";
  if (state === "arrived") return "picked_up";
  return "drop_off";
}

export default function DriverManifestScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInvoice, setLastInvoice] = useState<string>("");

  const completedCount = useMemo(() => rows.filter((t) => t.state === "drop_off").length, [rows]);
  const todayEarnings = useMemo(
    () => rows.filter((t) => t.state === "drop_off").reduce((sum, t) => sum + (t.booking?.base_fare ?? 0), 0),
    [rows],
  );

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error: qErr } = await supabase
        .from("trips")
        .select("id,state,eta,booking:bookings(id,pickup,dropoff,scheduled_at,base_fare,mobility)")
        .eq("driver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(25);

      if (qErr) {
        setError(qErr.message);
        setRows([]);
        return;
      }

      setRows((data ?? []) as unknown as TripRow[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function advanceTrip(trip: TripRow) {
    const next = nextState(trip.state);
    const supabase = getSupabase();
    const { error: uErr } = await supabase.from("trips").update({ state: next }).eq("id", trip.id);
    if (uErr) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Update failed", uErr.message);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRows((prev) => prev.map((t) => (t.id === trip.id ? { ...t, state: next } : t)));
    if (next === "drop_off") {
      // Placeholder invoice marker; web has Xero generation mocked.
      setLastInvoice(`INV-${trip.id.slice(0, 6).toUpperCase()} (xero_ready)`);
    }
  }

  return (
    <View className="flex-1 bg-slate-950">
      <MapBackdrop subtitle="Driver online. Trips will appear here." />

      <BottomSheet initialSnapIndex={2} snapPoints={[0.34, 0.62, 0.9]}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[18px] font-bold text-slate-900">Manifest</Text>
            <Text tone="muted" className="mt-1">
              Completed: {completedCount} · Est: ${todayEarnings.toFixed(2)}
            </Text>
          </View>
          <Button variant="outline" title={loading ? "Refreshing…" : "Refresh"} disabled={loading} onPress={() => void load()} />
        </View>

        {error ? (
          <Card className="mt-3">
            <Text tone="danger">Failed to load: {error}</Text>
          </Card>
        ) : null}

        <Divider className="my-4" />

        <View className="gap-3">
          {rows.length === 0 ? (
            <Card tone="muted">
              <Text className="font-semibold">No assigned trips</Text>
              <Text tone="muted" className="mt-1">
                Dispatch will assign trips when a booking matches your zone + certifications.
              </Text>
            </Card>
          ) : null}

          {rows.map((trip) => (
            <Card key={trip.id} className="border-slate-200">
              <View className="flex-row flex-wrap items-center justify-between gap-2">
                <View>
                  <Text className="text-[16px] font-bold text-slate-900">{trip.booking?.pickup ?? "Pickup"}</Text>
                  <Text tone="muted" className="mt-1">
                    To: {trip.booking?.dropoff ?? "—"}
                  </Text>
                </View>
                <Badge
                  label={trip.state.replace("_", " ")}
                  tone={trip.state === "drop_off" ? "certified" : trip.state === "arrived" ? "pending" : "default"}
                />
              </View>

              <View className="mt-3 flex-row flex-wrap gap-2">
                {trip.state !== "drop_off" ? (
                  <Button title={nextState(trip.state).replace("_", " ")} onPress={() => void advanceTrip(trip)} />
                ) : (
                  <Button variant="outline" title="Invoice generated" onPress={() => {}} />
                )}
                <Button
                  variant="outline"
                  title="Navigation"
                  onPress={() => Alert.alert("Navigation", "Hook this up to Google/Apple Maps deep link in Phase 2.")}
                />
                <Button
                  variant="outline"
                  title="Message"
                  onPress={() => Alert.alert("Chat", "Open Support tab to message operations / rider.")}
                />
              </View>
            </Card>
          ))}
        </View>

        <Card className="mt-4">
          <Text className="font-semibold">Auto invoice log</Text>
          <Text tone="muted" className="mt-1">
            {lastInvoice ? `Latest: ${lastInvoice}` : "No completed invoice yet in this session."}
          </Text>
        </Card>
      </BottomSheet>
    </View>
  );
}

