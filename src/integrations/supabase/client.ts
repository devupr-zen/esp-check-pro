import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// If you generated DB types: import type { Database } from '@/types/supabase'; // optional

// Read envs once for the whole app (Vite-style)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
	| string
	| undefined;

// Public flag you can use to show a banner/warning in the UI
export const supabaseEnvOk = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Use a global singleton to survive Vite HMR (and avoid multiple real-time connections)
declare global {
	// eslint-disable-next-line no-var
	var __supabase__: SupabaseClient | undefined;
}

function createClientOrThrow(): SupabaseClient {
	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		const msg =
			"[Supabase] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. " +
			"Set them in .env (local) and in Vercel → Project → Settings → Environment Variables.";
		// Throw on actual usage to avoid silent failures
		throw new Error(msg);
	}

	// If you have types, you can do:
	// return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
	return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		auth: { persistSession: true, autoRefreshToken: true },
	});
}

// Initialize once
export const supabase: SupabaseClient =
	globalThis.__supabase__ ?? (globalThis.__supabase__ = createClientOrThrow());

export default supabase;
