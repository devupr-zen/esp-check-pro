import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { TEACHER_NAV } from "@/config/navigation/teacherNav"
import { STUDENT_NAV } from "@/config/navigation/studentNav"
import { useSidebarState } from "@/hooks/useSidebarState"
import { useIsMobile } from "@/hooks/use-mobile"
import { TopBar } from "./TopBar"
import { Sidebar } from "./Sidebar"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { profile } = useAuth()
  const { isCollapsed, toggle } = useSidebarState()
  const isMobile = useIsMobile()
  const [showMobileOverlay, setShowMobileOverlay] = useState(false)

  // Get navigation based on user role
  const navigation = profile?.role === "teacher" ? TEACHER_NAV : STUDENT_NAV

  // Handle mobile overlay
  const handleMobileToggle = () => {
    if (isMobile) {
      setShowMobileOverlay(!showMobileOverlay)
    } else {
      toggle()
    }
  }

  // Close mobile overlay when route changes
  useEffect(() => {
    setShowMobileOverlay(false)
  }, [window.location.pathname])

  // Close mobile overlay when clicking outside
  useEffect(() => {
    if (!showMobileOverlay) return

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("app-sidebar")
      if (sidebar && !sidebar.contains(event.target as Node)) {
        setShowMobileOverlay(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showMobileOverlay])

  // Focus trap for mobile overlay
  useEffect(() => {
    if (!showMobileOverlay) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMobileOverlay(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showMobileOverlay])

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile Overlay */}
      {isMobile && showMobileOverlay && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setShowMobileOverlay(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        navigation={navigation}
        isCollapsed={isMobile ? false : isCollapsed}
        isMobile={isMobile}
        showMobileOverlay={showMobileOverlay}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopBar 
          onMenuToggle={handleMobileToggle}
          isMenuOpen={isMobile ? showMobileOverlay : !isCollapsed}
        />
        <main className="flex-1 p-6 overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}