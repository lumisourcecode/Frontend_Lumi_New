import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

type ExtraConfig = {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
};

export function getSupabaseConfig() {
  // Prefer app.config.ts -> config.extra (works in Expo Go + web).
  const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;
  const url = extra.EXPO_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export function hasSupabaseConfig() {
  const cfg = getSupabaseConfig();
  return !!cfg.url && !!cfg.anonKey;
}

let _client: SupabaseClient<any> | null = null;
export function getSupabase() {
  if (_client) return _client;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    throw new Error("Supabase not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
  }

  // We don't generate Database types yet; keep it permissive.
  _client = createClient<any>(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return _client;
}

