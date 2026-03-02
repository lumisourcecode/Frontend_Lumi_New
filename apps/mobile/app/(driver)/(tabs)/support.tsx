import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Pressable, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";
import { getSupabase } from "@/lib/supabase";

type MessageRow = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function DriverSupportScreen() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("messages")
        .select("id,sender_id,body,created_at")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(25);
      setRows((data ?? []) as MessageRow[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function send() {
    if (!user) return;
    const body = message.trim();
    if (!body) return;
    setMessage("");
    const supabase = getSupabase();
    const { error } = await supabase.from("messages").insert({ sender_id: user.id, body });
    if (error) {
      Alert.alert("Send failed", error.message);
      return;
    }
    void load();
  }

  return (
    <Screen refreshing={loading} onRefresh={load}>
      <Text tone="title">Support</Text>

      <Card className="mt-4">
        <Text tone="subtitle">In-app chat (driver → ops)</Text>
        <Text tone="muted" className="mt-2">
          For now this stores your messages in Supabase. Admin-side chat UI comes next.
        </Text>

        <View className="mt-3 gap-2">
          {rows.length === 0 ? (
            <Text tone="muted">No messages yet.</Text>
          ) : (
            rows.map((m) => (
              <View key={m.id} className="rounded-2xl bg-slate-50 p-3">
                <Text className="font-semibold">You</Text>
                <Text className="mt-1">{m.body}</Text>
                <Text tone="muted" className="mt-1 text-[12px]">
                  {new Date(m.created_at).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>

        <View className="mt-3 flex-row gap-2">
          <View className="flex-1">
            <Input value={message} onChangeText={setMessage} placeholder="Type a message…" />
          </View>
          <Button title="Send" onPress={() => void send()} />
        </View>
      </Card>

      <Card className="mt-4">
        <Text tone="subtitle">Emergency</Text>
        <Text tone="muted" className="mt-2">
          SOS triggers immediate dispatch escalation. In Phase 2 we will also create an incident record + push notifications.
        </Text>
        <View className="mt-3">
          <Button variant="danger" title="SOS" onPress={() => setSosOpen(true)} />
        </View>
      </Card>

      <Modal animationType="slide" transparent visible={sosOpen} onRequestClose={() => setSosOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setSosOpen(false)} />
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5">
          <Text tone="title">SOS</Text>
          <Text tone="muted" className="mt-2">
            Confirm to alert Lumi operations. If you are in immediate danger, call emergency services.
          </Text>
          <View className="mt-4 flex-row gap-2">
            <View className="flex-1">
              <Button variant="outline" title="Cancel" onPress={() => setSosOpen(false)} />
            </View>
            <View className="flex-1">
              <Button
                variant="danger"
                title="Send SOS"
                onPress={() => {
                  setSosOpen(false);
                  Alert.alert("SOS sent", "Dispatch has been alerted (mock).");
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

