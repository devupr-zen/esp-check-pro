// src/hooks/useSidebarState.ts
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export function useSidebarState() {
  const { user } = useAuth()
  const key = user?.id ? `upraizen:sidebar:${user.id}` : "upraizen:sidebar:anon"
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(isCollapsed))
    } catch {}
  }, [isCollapsed, key])

  return { isCollapsed, toggle: () => setIsCollapsed(v => !v) }
}
