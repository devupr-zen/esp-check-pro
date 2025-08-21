// src/components/shell/MainLayout.tsx
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "./AppShell"; // keep if you already use it
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/components/auth/AuthProvider";
import { getNavForRole } from "@/config/navigation"; // role → NavItem[]

/** Minimal error boundary to prevent whole-app white screens */
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Route error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <strong className="text-destructive">Something went wrong.</strong>{" "}
            Try reloading or navigating to another page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface MainLayoutProps {
  children: React.ReactNode;
}

/** Simple hook to detect mobile by width */
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const location = useLocation();

  // Role-filtered nav
  const navForRole = useMemo(
    () => getNavForRole(profile?.role ?? "student"),
    [profile?.role]
  );

  // Auto page title from nav (best-effort)
  const pageTitle = useMemo(() => {
    // exact match first
    const exact = navForRole.find((n) => n.href === location.pathname)?.label;
    if (exact) return exact;
    // prefix match fallback (e.g., /teacher/classes/123 → Classes)
    const prefix = navForRole
      .filter((n) => location.pathname.startsWith(n.href))
      .sort((a, b) => b.href.length - a.href.length)[0]?.label;
    return prefix ?? " ";
  }, [location.pathname, navForRole]);

  // When breakpoint changes, close mobile drawer and reset collapse
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
      setShowMobileOverlay(false);
    }
  }, [isMobile]);

  return (
    <AppShell>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isMobile={isMobile}
          isCollapsed={!isMobile && isCollapsed}
          showMobileOverlay={showMobileOverlay}
          setShowMobileOverlay={setShowMobileOverlay}
          navigation={navForRole}
        />

        {/* Content area */}
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar pageTitle={pageTitle} />

          <RouteErrorBoundary>
            <Suspense
              fallback={
                <div className="p-6">
                  <div className="mb-3 h-6 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-64 animate-pulse rounded bg-muted" />
                </div>
              }
            >
              <main className="flex-1 p-4 md:p-6">{children}</main>
            </Suspense>
          </RouteErrorBoundary>
        </div>
      </div>
    </AppShell>
  );
}
