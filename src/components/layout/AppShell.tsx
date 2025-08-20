// src/components/shell/AppShell.tsx
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
	defaultFeatures,
	type FeatureFlags,
	getNavForRole,
	type Role,
} from "@/config/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebarState } from "@/hooks/useSidebarState";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
	children: React.ReactNode;
	/**
	 * Optional feature flags to hide/show certain nav items at runtime.
	 * Defaults to `defaultFeatures`.
	 */
	features?: FeatureFlags;
}

export function AppShell({
	children,
	features = defaultFeatures,
}: AppShellProps) {
	const { profile, loading } = useAuth();
	const { isCollapsed, toggle } = useSidebarState();
	const isMobile = useIsMobile();
	const [showMobileOverlay, setShowMobileOverlay] = useState(false);

	// Resolve role: prefer profile.role, fallback to remembered intent, default student
	const role: Role = useMemo(() => {
		if (profile?.role) return profile.role as Role;
		const remembered =
			(typeof window !== "undefined"
				? (localStorage.getItem("upraizenRole") as Role | null)
				: null) || "student";
		return remembered;
	}, [profile?.role]);

	// Build role-scoped navigation
	const navigation = useMemo(
		() => getNavForRole(role, features),
		[role, features],
	);

	// Toggle handler: drawer on mobile, collapse on desktop
	const handleMenuToggle = () => {
		if (isMobile) setShowMobileOverlay((v) => !v);
		else toggle();
	};

	// Optional: if auth is still loading, render a minimal skeleton for layout stability
	if (loading) {
		return (
			<div className="min-h-screen flex w-full bg-background">
				<aside className="hidden lg:block w-72 h-screen bg-background/80 border-r" />
				<div className="flex-1 flex flex-col">
					<div className="h-16 border-b bg-background/60" />
					<main className="flex-1 p-6">
						<div className="animate-pulse h-6 w-40 bg-muted rounded mb-4" />
						<div className="animate-pulse h-4 w-64 bg-muted rounded" />
					</main>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex w-full bg-background">
			{/* Mobile overlay scrim (click handled in Sidebar too; this is just the dim layer) */}
			{isMobile && showMobileOverlay && (
				<div
					className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
					onClick={() => setShowMobileOverlay(false)}
					aria-hidden="true"
				/>
			)}

			{/* Sidebar */}
			<Sidebar
				key={role} // reset internal state if role changes
				navigation={navigation}
				isCollapsed={isCollapsed}
				isMobile={isMobile}
				showMobileOverlay={showMobileOverlay}
				setShowMobileOverlay={setShowMobileOverlay}
			/>

			{/* Main content */}
			<div className="flex-1 flex flex-col">
				<TopBar
					onMenuToggle={handleMenuToggle}
					isMenuOpen={isMobile ? showMobileOverlay : !isCollapsed}
				/>
				<main className="flex-1 p-6 overflow-auto scrollbar-thin">
					{children}
				</main>
			</div>
		</div>
	);
}
