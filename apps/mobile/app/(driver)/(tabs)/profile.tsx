import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabase } from "@/lib/supabase";

type DocRow = {
  id: string;
  doc_type: string;
  status: string;
  expiry: string | null;
};

export default function DriverProfileScreen() {
  const { user, profile, devSetRole, signOut } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error: qErr } = await supabase
        .from("driver_documents")
        .select("id,doc_type,status,expiry")
        .eq("driver_id", user.id)
        .order("doc_type", { ascending: true });

      if (qErr) {
        setError(qErr.message);
        setDocs([]);
        return;
      }

      setDocs((data ?? []) as DocRow[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const verificationTone = docs.some((d) => d.status.toLowerCase().includes("expired"))
    ? "danger"
    : docs.some((d) => d.status.toLowerCase().includes("pending"))
      ? "pending"
      : "certified";

  const verificationLabel =
    verificationTone === "certified"
      ? "Verified"
      : verificationTone === "pending"
        ? "Pending"
        : "Expired";

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <Text tone="title">Driver Profile</Text>

      <Card className="mt-4">
        <Text tone="subtitle">Account</Text>
        <Text tone="muted" className="mt-2">
          Email: {user?.email ?? "—"}
        </Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Text tone="muted">Verification:</Text>
          <Badge label={verificationLabel} tone={verificationTone as any} />
        </View>
        <Text tone="muted" className="mt-2">
          Role: {profile?.role ?? "—"}
        </Text>
      </Card>

      {error ? (
        <Card className="mt-4">
          <Text tone="danger">Failed to load docs: {error}</Text>
        </Card>
      ) : null}

      <Card className="mt-4">
        <Text tone="subtitle">Documents</Text>
        <View className="mt-3 gap-2">
          {docs.length === 0 ? (
            <Text tone="muted">
              No documents found yet. Once you run the Supabase seed data, docs will appear here.
            </Text>
          ) : null}
          {docs.map((d) => (
            <View key={d.id} className="flex-row flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3">
              <View>
                <Text className="font-semibold">{d.doc_type}</Text>
                <Text tone="muted" className="mt-1">
                  Expiry: {d.expiry ? new Date(d.expiry).toLocaleDateString() : "—"}
                </Text>
              </View>
              <Badge
                label={d.status}
                tone={
                  d.status.toLowerCase().includes("verified")
                    ? "certified"
                    : d.status.toLowerCase().includes("pending")
                      ? "pending"
                      : "danger"
                }
              />
            </View>
          ))}
        </View>

        <Text tone="muted" className="mt-3">
          Upload flows come next (camera scan, file upload, admin verification, expiry reminders).
        </Text>
      </Card>

      <Card className="mt-4">
        <Text tone="subtitle">Developer tools (temporary)</Text>
        <View className="mt-3 flex-row gap-2">
          <View className="flex-1">
            <Button variant="outline" title="Set Rider" onPress={() => devSetRole("rider")} />
          </View>
          <View className="flex-1">
            <Button title="Set Driver" onPress={() => devSetRole("driver")} />
          </View>
        </View>
      </Card>

      <View className="mt-4">
        <Button variant="outline" title="Sign out" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}

