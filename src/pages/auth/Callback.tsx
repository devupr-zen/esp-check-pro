// src/pages/auth/Callback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
	const nav = useNavigate();
	useEffect(() => {
		(async () => {
			// (Optional) exchange if using OAuth code flow:
			// await supabase.auth.exchangeCodeForSession(window.location.href);

			const {
				data: { user },
			} = await supabase.auth.getUser();
			const returnTo = new URLSearchParams(window.location.search).get(
				"returnTo",
			);

			if (!user) return nav("/"); // no session → landing

			// fetch role
			const { data: profile } = await supabase
				.from("profiles")
				.select("role")
				.eq("id", user.id)
				.single();

			const role = profile?.role ?? "student";
			if (returnTo) return nav(returnTo, { replace: true });
			if (role === "teacher") return nav("/teacher", { replace: true });
			if (role === "superadmin") return nav("/admin", { replace: true });
			return nav("/student", { replace: true });
		})();
	}, [nav]);

	return null;
}
