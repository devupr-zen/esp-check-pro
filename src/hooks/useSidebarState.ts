import { useState, useEffect } from "react"

const STORAGE_KEY = "sidebarCollapsed"

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed))
    } catch {
      // Ignore localStorage errors
    }
  }, [isCollapsed])

  const toggle = () => setIsCollapsed(!isCollapsed)

  return { isCollapsed, toggle }
}