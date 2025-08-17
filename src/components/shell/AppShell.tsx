// src/components/shell/AppShell.tsx
import React, { useMemo, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"
import { useSidebarState } from "@/hooks/useSidebarState"
import { teacherNav, studentNav } from "@/config/navigation"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  const { isCollapsed, toggle } = useSidebarState()
  const [showMobileOverlay, setShowMobileOverlay] = useState(false)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024

  const navigation = useMemo(
    () => (profile?.role === "teacher" ? teacherNav : studentNav),
    [profile?.role]
  )

  const onMenuToggle = () => (isMobile ? setShowMobileOverlay(v => !v) : toggle())

  return (
    <div className="flex">
      <Sidebar
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        showMobileOverlay={showMobileOverlay}
        setShowMobileOverlay={setShowMobileOverlay}
        toggle={toggle}
        navigation={navigation}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar onMenuToggle={onMenuToggle} isMenuOpen={isMobile ? showMobileOverlay : !isCollapsed} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
}
