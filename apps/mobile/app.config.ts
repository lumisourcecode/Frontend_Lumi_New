import "dotenv/config";
import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    // Ensure required fields are always present
    name: config.name ?? "Lumi Ride Mobile",
    slug: config.slug ?? "lumi-ride-mobile",
    extra: {
      ...(config.extra ?? {}),
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  };
};

