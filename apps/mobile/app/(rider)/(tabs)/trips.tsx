import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabase } from "@/lib/supabase";

type BookingRow = {
  id: string;
  pickup: string;
  dropoff: string;
  scheduled_at: string;
  status: string;
  base_fare: number;
  mptp_eligible: boolean;
};

export default function RiderTripsScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error: qErr } = await supabase
        .from("bookings")
        .select("id,pickup,dropoff,scheduled_at,status,base_fare,mptp_eligible")
        .eq("rider_id", user.id)
        .order("scheduled_at", { ascending: false })
        .limit(50);

      if (qErr) {
        setError(qErr.message);
        setRows([]);
        return;
      }

      setRows((data ?? []) as BookingRow[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View className="flex-row items-center justify-between">
        <Text tone="title">Trips</Text>
        <Button variant="outline" title="Refresh" onPress={load} />
      </View>

      {error ? (
        <Card className="mt-4">
          <Text tone="danger">Failed to load: {error}</Text>
        </Card>
      ) : null}

      <View className="mt-4 gap-3">
        {rows.length === 0 ? (
          <Card>
            <Text tone="muted">No bookings yet. Create one from the Book tab.</Text>
          </Card>
        ) : null}

        {rows.map((b) => (
          <Card key={b.id}>
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <Text className="font-semibold">{b.pickup}</Text>
              <Badge
                label={b.status}
                tone={b.status === "pending_matching" ? "pending" : b.status === "completed" ? "certified" : "default"}
              />
            </View>
            <Text tone="muted" className="mt-1">
              To: {b.dropoff}
            </Text>
            <Text tone="muted" className="mt-1">
              Scheduled: {new Date(b.scheduled_at).toLocaleString()}
            </Text>
            <Text tone="muted" className="mt-1">
              Base fare: ${Number(b.base_fare ?? 0).toFixed(2)} {b.mptp_eligible ? "(MPTP eligible)" : ""}
            </Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

