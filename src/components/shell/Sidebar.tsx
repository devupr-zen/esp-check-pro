// src/components/shell/Sidebar.tsx
import React, { useEffect, useRef } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

type SidebarProps = {
  isMobile: boolean;
  isCollapsed: boolean;
  showMobileOverlay: boolean;
  setShowMobileOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  navigation: NavItem[]; // role-filtered list from getNavForRole()
};

export function Sidebar({
  isMobile,
  isCollapsed,
  showMobileOverlay,
  setShowMobileOverlay,
  navigation,
}: SidebarProps) {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  // Close drawer on route change (mobile)
  useEffect(() => {
    if (isMobile) setShowMobileOverlay(false);
  }, [location.pathname, isMobile, setShowMobileOverlay]);

  // Click outside to close (mobile)
  useEffect(() => {
    if (!showMobileOverlay) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowMobileOverlay(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showMobileOverlay, setShowMobileOverlay]);

  // Escape key to close (mobile)
  useEffect(() => {
    if (!showMobileOverlay) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowMobileOverlay(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showMobileOverlay, setShowMobileOverlay]);

  const sidebarClasses = cn(
    "glass-navigation border-r-0 bg-background/95 backdrop-blur-lg transition-all duration-300",
    isMobile
      ? cn("fixed top-0 left-0 z-50 h-full w-72", showMobileOverlay ? "translate-x-0" : "-translate-x-full")
      : cn("relative h-screen", isCollapsed ? "w-16" : "w-72")
  );

  const roleLetter = (profile?.role?.[0] || "U").toUpperCase();
  const roleLabel =
    profile?.role === "teacher" ? "Teacher"
    : profile?.role === "student" ? "Student"
    : profile?.role === "superadmin" ? "Admin"
    : "User";

  return (
    <>
      {/* Mobile scrim */}
      {isMobile && showMobileOverlay && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          aria-hidden="true"
          onClick={() => setShowMobileOverlay(false)}
        />
      )}

      <aside
        id="app-sidebar"
        ref={ref}
        className={sidebarClasses}
        aria-hidden={isMobile ? !showMobileOverlay : false}
        aria-label="Primary"
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          {(!isCollapsed || isMobile) && (
            <div>
              <h1 className="text-xl font-bold text-primary">Upraizen</h1>
              <p className="text-xs text-muted-foreground">ESPCheck Pro</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "hover:bg-accent hover:text-accent-foreground text-foreground"
                    )
                  }
                >
                  {Icon ? <Icon className="h-4 w-4 shrink-0" /> : <div className="h-4 w-4" />}
                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {/* Tooltip when collapsed (desktop only) */}
                  {isCollapsed && !isMobile && (
                    <div className="absolute left-16 ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        {(!isCollapsed || isMobile) && (
          <div className="mt-auto p-4 border-t border-border/50">
            <div className="glass-card p-3 text-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">{roleLetter}</span>
              </div>
              <p className="text-xs font-medium text-foreground">{roleLabel}</p>
              <p className="text-xs text-muted-foreground">Account</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
