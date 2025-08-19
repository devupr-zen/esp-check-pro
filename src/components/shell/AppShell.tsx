// src/components/shell/AppShell.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSidebarState } from "@/hooks/useSidebarState";
import {
  getNavForRole,
  defaultFeatures,
  type Role,
  type FeatureFlags,
} from "@/config/navigation";

type AppShellProps = {
  children: React.ReactNode;
  /**
   * Optional feature flags to hide/show items at runtime.
   * Defaults to `defaultFeatures`.
   */
  features?: FeatureFlags;
};

export function AppShell({ children, features = defaultFeatures }: AppShellProps) {
  const { profile, loading } = useAuth();
  const { isCollapsed, toggle } = useSidebarState();

  // Responsive: avoid touching `window` during SSR and respond to resizes
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window === "undefined" ? false : window.innerWidth < 1024
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [showMobileOverlay, setShowMobileOverlay] = useState(false);

  // Role resolution: prefer profile.role; fall back to remembered intent
  const role: Role = useMemo(() => {
    if (profile?.role) return profile.role as Role;
    const remembered = (typeof window !== "undefined"
      ? (localStorage.getItem("upraizenRole") as Role | null)
      : null) || "student";
    return remembered;
  }, [profile?.role]);

  // Build role-scoped, feature-filtered navigation
  const navigation = useMemo(() => getNavForRole(role, features), [role, features]);

  const onMenuToggle = () => {
    if (isMobile) setShowMobileOverlay((v) => !v);
    else toggle();
  };

  // While auth is loading, render a minimal shell skeleton so layout is stable
  if (loading) {
    return (
      <div className="flex">
        <aside className="w-72 lg:w-72 h-screen bg-background/80 border-r" />
        <div className="flex min-h-screen flex-1 flex-col">
          <div className="h-14 border-b bg-background/60" />
          <main className="p-4">
            <div className="animate-pulse h-6 w-40 bg-muted rounded mb-4" />
            <div className="animate-pulse h-4 w-64 bg-muted rounded" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar
        key={role}
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        showMobileOverlay={showMobileOverlay}
        setShowMobileOverlay={setShowMobileOverlay}
        navigation={navigation}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar onMenuToggle={onMenuToggle} isMenuOpen={isMobile ? showMobileOverlay : !isCollapsed} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
