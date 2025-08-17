import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface NavigationItem {
  label: string
  icon: LucideIcon
  href: string
}

interface SidebarProps {
  navigation: NavigationItem[]
  isCollapsed: boolean
  isMobile: boolean
  showMobileOverlay: boolean
}

export function Sidebar({ navigation, isCollapsed, isMobile, showMobileOverlay }: SidebarProps) {
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/"
    return location.pathname.startsWith(href)
  }

  const sidebarClasses = cn(
    "glass-navigation border-r-0 bg-background/95 backdrop-blur-lg transition-all duration-300",
    isMobile 
      ? cn(
          "fixed top-0 left-0 z-50 h-full",
          showMobileOverlay ? "w-72 translate-x-0" : "w-72 -translate-x-full"
        )
      : cn(
          "relative h-screen",
          isCollapsed ? "w-16" : "w-72"
        )
  )

  return (
    <aside id="app-sidebar" className={sidebarClasses}>
      {/* Logo and Brand */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          {(!isCollapsed || isMobile) && (
            <div>
              <h1 className="text-xl font-bold text-primary">Upraizen</h1>
              <p className="text-xs text-muted-foreground">ESPCheck Pro</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive: active }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "hover:bg-accent hover:text-accent-foreground text-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-16 ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Info at Bottom */}
      {(!isCollapsed || isMobile) && (
        <div className="mt-auto p-4 border-t border-border/50">
          <div className="glass-card p-3 text-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {/* This will be populated with user role indicator */}
                T
              </span>
            </div>
            <p className="text-xs font-medium text-foreground">Teacher</p>
            <p className="text-xs text-muted-foreground">Account</p>
          </div>
        </div>
      )}
    </aside>
  )
}