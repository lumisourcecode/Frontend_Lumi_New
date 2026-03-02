import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { getSupabase, getSupabaseConfig } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cfg = useMemo(() => getSupabaseConfig(), []);

  async function onSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      const { error: signInError } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const msg = signInError.message || "Sign in failed";
        // Provide some high-signal hints for Supabase common issues.
        if (msg.toLowerCase().includes("email not confirmed")) {
          setError("Email not confirmed. Check your inbox, or disable email confirmations in Supabase Auth settings.");
        } else if (msg.toLowerCase().includes("invalid login credentials")) {
          setError("Invalid credentials. Double-check email/password. If you just signed up, confirm your email first.");
        } else {
          setError(msg);
        }
      } else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="overflow-hidden rounded-3xl">
          <LinearGradient colors={["#0B1026", "#141B63", "#0F4C81"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View className="p-5">
              <Text className="text-white text-[26px] font-bold">Welcome back</Text>
              <Text className="mt-1 text-slate-200">
                Rider + Driver access. Built like a modern ride app.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <Card className="mt-4">
          <Text tone="subtitle">Sign in</Text>
          <View className="mt-3 gap-3">
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="username"
            />
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              textContentType="password"
            />

            {error ? <Text tone="danger">{error}</Text> : null}

            <Button title={submitting ? "Signing in…" : "Sign in"} disabled={submitting} onPress={onSignIn} />

            <Divider className="my-2" />

            <Button
              variant="outline"
              title="Troubleshoot login"
              onPress={() => {
                Alert.alert(
                  "Login checklist",
                  [
                    "1) Supabase Auth -> Providers: Email enabled",
                    "2) If email confirmations enabled: confirm your email before signing in",
                    "3) Ensure you ran apps/mobile/supabase/schema.sql",
                    `4) Supabase URL loaded: ${cfg.url ? "yes" : "no"}`,
                  ].join("\n\n"),
                );
              }}
            />

            <Text tone="muted">
              No account?{" "}
              <Link href="/(auth)/sign-up" suppressHighlighting>
                <Text className="text-indigo-700 font-semibold">Create one</Text>
              </Link>
            </Text>
          </View>
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

