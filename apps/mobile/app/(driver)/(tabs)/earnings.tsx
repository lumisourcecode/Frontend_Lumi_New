import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabase } from "@/lib/supabase";

type TripRow = {
  id: string;
  state: string;
  booking: { base_fare: number } | null;
};

export default function DriverEarningsScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error: qErr } = await supabase
        .from("trips")
        .select("id,state,booking:bookings(base_fare)")
        .eq("driver_id", user.id)
        .eq("state", "drop_off")
        .order("created_at", { ascending: false })
        .limit(200);

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

  const total = useMemo(() => rows.reduce((sum, t) => sum + (t.booking?.base_fare ?? 0), 0), [rows]);

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <View className="flex-row items-center justify-between">
        <Text tone="title">Earnings</Text>
        <Button variant="outline" title="Refresh" onPress={load} />
      </View>

      <Card className="mt-4">
        <Text tone="subtitle">Completed trip earnings</Text>
        <Text className="mt-2 text-[28px] font-bold text-slate-900">${total.toFixed(2)}</Text>
        <Text tone="muted" className="mt-1">
          Based on completed trips (state = drop_off).
        </Text>
      </Card>

      {error ? (
        <Card className="mt-4">
          <Text tone="danger">Failed to load: {error}</Text>
        </Card>
      ) : null}

      <Card className="mt-4">
        <Text tone="subtitle">Payouts</Text>
        <Text tone="muted" className="mt-2">
          Payout scheduling + wallet connection is next (bank details, cashout, statements).
        </Text>
      </Card>
    </Screen>
  );
}

