// src/components/shell/AppSidebar.tsx (or wherever your AppSidebar lives)
import React, { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Sidebar as ShellSidebar } from "@/components/shell/Sidebar";
import {
	defaultFeatures,
	type FeatureFlags,
	getNavForRole,
	type Role,
} from "@/config/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebarState } from "@/hooks/useSidebarState";

/**
 * Compatibility wrapper that renders the standardized shell Sidebar.
 * It keeps the old import name (AppSidebar) but delegates to the new role-aware Sidebar.
 */
export function AppSidebar({
	features = defaultFeatures,
}: {
	features?: FeatureFlags;
}) {
	const { profile } = useAuth();
	const { isCollapsed } = useSidebarState();
	const isMobile = useIsMobile();
	const [showMobileOverlay, setShowMobileOverlay] = useState(false);

	// Resolve role (prefer profile, fall back to remembered intent, default student)
	const role: Role = useMemo(() => {
		if (profile?.role) return profile.role as Role;
		const remembered =
			(typeof window !== "undefined"
				? (localStorage.getItem("upraizenRole") as Role | null)
				: null) || "student";
		return remembered;
	}, [profile?.role]);

	const navigation = useMemo(
		() => getNavForRole(role, features),
		[role, features],
	);

	return (
		<ShellSidebar
			key={role}
			navigation={navigation}
			isCollapsed={isCollapsed}
			isMobile={isMobile}
			showMobileOverlay={showMobileOverlay}
			setShowMobileOverlay={setShowMobileOverlay}
		/>
	);
}
