// src/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined;
}

function createClientOrThrow(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const msg =
      "[Supabase] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. " +
      "Set them in Vercel → Project → Settings → Environment Variables (Preview & Production).";
    // Log once to make it obvious in the browser console
    console.error(msg);
    throw new Error(msg);
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

// Reuse across HMR
export const supabase: SupabaseClient =
  globalThis.__supabase__ ?? (globalThis.__supabase__ = createClientOrThrow());
