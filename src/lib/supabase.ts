import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
	| string
	| undefined;

export const supabaseEnvOk = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let supabase: SupabaseClient;

if (supabaseEnvOk) {
	supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
		auth: { persistSession: true, autoRefreshToken: true },
	});
} else {
	const msg =
		"[Supabase] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. Set them in Vercel → Project → Settings → Environment Variables.";
	console.error(msg);
	supabase = new Proxy({} as SupabaseClient, {
		get() {
			throw new Error(msg);
		},
	});
}

export { supabase };
