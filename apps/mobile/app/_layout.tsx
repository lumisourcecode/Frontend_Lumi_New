import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { View } from "react-native";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { hasSupabaseConfig } from "@/lib/supabase";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!hasSupabaseConfig()) {
    return (
      <Screen>
        <Card>
          <Text tone="title">Supabase not configured</Text>
          <Text tone="muted" className="mt-2">
            Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `apps/mobile/.env`,
            then restart Expo.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isReady, user, profile } = useAuth();

  // Simple auth gate + role routing.
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    if (!user) {
      if (!inAuthGroup) router.replace("/(auth)/sign-in");
      return;
    }

    if (!profile) {
      // If schema/RLS isn't ready yet, keep user in auth group with a hint.
      if (!inAuthGroup) router.replace("/(auth)/profile-loading");
      return;
    }

    const desiredRoot = profile.role === "driver" ? "(driver)" : "(rider)";
    if (segments[0] !== desiredRoot) {
      router.replace(profile.role === "driver" ? "/(driver)/(tabs)/manifest" : "/(rider)/(tabs)/home");
    }
  }, [isReady, profile, router, segments, user]);

  // While router is deciding, show a minimal blank container to avoid flicker.
  if (!isReady) return <View />;

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(rider)" options={{ headerShown: false }} />
        <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
