import { Loader2 } from "lucide-react";
import React, { type PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

export type Role = "teacher" | "student" | "superadmin";

interface RouteGuardProps {
	/** If provided, require both authentication and this role. If omitted, only requires authentication. */
	requireRole?: Role;
}

// Map each role to its proper home route (adjust if your app differs)
const ROLE_HOME: Record<Role, string> = {
	student: "/student/dashboard",
	teacher: "/teacher/dashboard",
	superadmin: "/superadmin",
};

// Small helper to read any locally stored role intent (set by landing buttons)
function getLocalRoleIntent(): Role | null {
	const raw = localStorage.getItem("upraizenRole");
	return raw === "teacher" || raw === "superadmin" || raw === "student"
		? raw
		: null;
}

// Default export (component)
export default function RouteGuard({
	requireRole,
	children,
}: PropsWithChildren<RouteGuardProps>) {
	const { user, profile, loading } = useAuth();
	const location = useLocation();

	// While AuthProvider is still resolving session/profile, show a lightweight gate
	if (loading) {
		return (
			<div className="p-6 flex items-center gap-2 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span>Checking access…</span>
			</div>
		);
	}

	// Not authenticated → send to the proper auth page, preserving returnTo
	if (!user) {
		const returnTo = encodeURIComponent(location.pathname + location.search);
		// Prefer the explicitly required role; otherwise fall back to intent; else default to student
		const intended: Role = requireRole ?? getLocalRoleIntent() ?? "student";

		const authPath =
			intended === "teacher"
				? "/auth/teacher"
				: intended === "superadmin"
					? "/auth/superadmin"
					: "/auth/student";

		return <Navigate to={`${authPath}?returnTo=${returnTo}`} replace />;
	}

	// Authenticated but profile not yet present (rare after loading=false) → hold briefly
	if (!profile) {
		return (
			<div className="p-6 flex items-center gap-2 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span>Preparing your workspace…</span>
			</div>
		);
	}

	// Role check (only if a role is required)
	if (requireRole) {
		const role: Role = (profile.role as Role) ?? "student";

		// Superadmin can access both student/teacher areas
		const roleMatches =
			role === requireRole ||
			(role === "superadmin" &&
				(requireRole === "teacher" || requireRole === "student"));

		if (!roleMatches) {
			// Redirect to the correct home for their actual role
			return <Navigate to={ROLE_HOME[role]} replace />;
		}
	}

	return <>{children}</>;
}

/* ------------------------------------------------------------------
   Backward-compatibility shims so both styles compile:

     import RouteGuard from '@/components/auth/RouteGuard'
     import { RouteGuard, requireRole } from '@/components/auth/RouteGuard'

------------------------------------------------------------------- */
export { RouteGuard }; // named export of the default component
export const requireRole = (_role: Role) => undefined;
