// src/components/shell/Sidebar.tsx
import React, { useEffect, useRef } from "react"
import { useLocation, NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

export function Sidebar({
  isMobile,
  isCollapsed,
  showMobileOverlay,
  setShowMobileOverlay,
  toggle,
  navigation, // [{ href, label, icon: Icon }]
}: any) {
  const location = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href)

  // Close on route change
  useEffect(() => {
    if (isMobile) setShowMobileOverlay(false)
  }, [location.pathname, isMobile, setShowMobileOverlay])

  // Click outside
  useEffect(() => {
    if (!showMobileOverlay) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowMobileOverlay(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [showMobileOverlay, setShowMobileOverlay])

  // Escape key
  useEffect(() => {
    if (!showMobileOverlay) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowMobileOverlay(false)
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [showMobileOverlay, setShowMobileOverlay])

  const sidebarClasses = cn(
    "glass-navigation border-r-0 bg-background/95 backdrop-blur-lg transition-all duration-300",
    isMobile
      ? cn("fixed top-0 left-0 z-50 h-full w-72", showMobileOverlay ? "translate-x-0" : "-translate-x-full")
      : cn("relative h-screen", isCollapsed ? "w-16" : "w-72")
  )

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
        <div className="p-3">
          <div className="mb-4 flex items-center gap-2">
            {/* Logo */}
            <div className="h-8 w-8 rounded-xl bg-primary/10" />
            {!isCollapsed && <div className="font-semibold">Upraizen</div>}
          </div>

          <nav className="space-y-1">
            {navigation.map((item: any) => {
              const active = isActive(item.href)
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-accent hover:text-accent-foreground text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
