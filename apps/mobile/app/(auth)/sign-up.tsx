import { useState } from "react";
import { Link } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignUp() {
    setError(null);
    setSubmitting(true);
    try {
      const { data, error: signUpError } = await getSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || null,
          },
        },
      });
      if (signUpError) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(signUpError.message);
        return;
      }

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (!data.session) {
        Alert.alert(
          "Check your email",
          "Your account was created. Confirm your email, then come back and sign in.",
        );
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
              <Text className="text-white text-[26px] font-bold">Create your account</Text>
              <Text className="mt-1 text-slate-200">
                Save locations, accessibility needs, and rebook instantly.
              </Text>
            </View>
          </LinearGradient>
        </View>

        <Card className="mt-4">
          <Text tone="subtitle">Sign up</Text>
          <View className="mt-3 gap-3">
            <Input value={fullName} onChangeText={setFullName} placeholder="Full name (optional)" />
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
              textContentType="newPassword"
            />

            {error ? <Text tone="danger">{error}</Text> : null}

            <Button title={submitting ? "Creating…" : "Create account"} disabled={submitting} onPress={onSignUp} />

            <Divider className="my-2" />

            <Text tone="muted">
              If sign-in fails after signup, you may need to confirm your email in Supabase.
            </Text>

            <Text tone="muted">
              Already have an account?{" "}
              <Link href="/(auth)/sign-in" suppressHighlighting>
                <Text className="text-indigo-700 font-semibold">Sign in</Text>
              </Link>
            </Text>
          </View>
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

