import { Alert, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";

export default function RiderProfileScreen() {
  const { profile, user, signOut, devSetRole } = useAuth();

  return (
    <Screen>
      <Text tone="title">Profile</Text>

      <Card className="mt-4">
        <Text tone="subtitle">Account</Text>
        <Text tone="muted" className="mt-2">
          Email: {user?.email ?? "—"}
        </Text>
        <Text tone="muted" className="mt-1">
          Role: {profile?.role ?? "—"}
        </Text>
      </Card>

      <Card className="mt-4">
        <Text tone="subtitle">Saved locations</Text>
        <View className="mt-3 gap-2">
          <Input placeholder="Home (placeholder)" editable={false} />
          <Input placeholder="Work / Clinic (placeholder)" editable={false} />
          <Text tone="muted">We’ll wire Google Places later; these are placeholders for now.</Text>
        </View>
      </Card>

      <Card className="mt-4">
        <Text tone="subtitle">Payment methods</Text>
        <Text tone="muted" className="mt-2">
          Card saving + auto-pay is planned for Phase 2. For now, we store booking + billing metadata in Supabase.
        </Text>
      </Card>

      <Card className="mt-4">
        <Text tone="subtitle">Developer tools (temporary)</Text>
        <Text tone="muted" className="mt-2">
          Switch role to test Driver UI on the same device.
        </Text>
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
        <Button
          variant="outline"
          title="Sign out"
          onPress={() => {
            Alert.alert("Sign out", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign out", style: "destructive", onPress: () => void signOut() },
            ]);
          }}
        />
      </View>
    </Screen>
  );
}

