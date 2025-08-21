// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ✅ health flag you use in App.tsx
export const supabaseEnvOk = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function createClientOrThrow(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "[Supabase] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. " +
        "Set them in your .env.local (for dev) and in Vercel → Settings → Environment Variables."
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storageKey: "upraizen.auth", // unique key for your app
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

// ✅ singleton pattern so Vite HMR doesn’t create multiple clients
declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined;
}

export const supabase: SupabaseClient =
  globalThis.__supabase__ ?? (globalThis.__supabase__ = createClientOrThrow());

export default supabase;
