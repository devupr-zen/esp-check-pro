// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read Vite envs (available at build & runtime)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Exported flag used by App.tsx to show a warning banner
export const supabaseEnvOk = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Keep a single client instance across HMR
declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined;
}

function makeClient(): SupabaseClient {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      storageKey: "upraizen.auth",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

// If envs are OK, create/return real client; else return a Proxy that throws with a helpful message
export const supabase: SupabaseClient =
  supabaseEnvOk
    ? (globalThis.__supabase__ ?? (globalThis.__supabase__ = makeClient()))
    : new Proxy({} as SupabaseClient, {
        get() {
          throw new Error(
            "[Supabase] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. " +
              "Set them in Vercel → Project → Settings → Environment Variables (Preview & Production)."
          );
        },
      });
