// src/lib/ensureRole.ts
import { supabase } from "@/lib/supabase";

export async function ensureRole(role: "student" | "teacher" | "superadmin") {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return;

	await supabase.from("profiles").upsert(
		{
			id: user.id,
			role,
			email: user.email ?? undefined,
		},
		{ onConflict: "id" },
	);
}
