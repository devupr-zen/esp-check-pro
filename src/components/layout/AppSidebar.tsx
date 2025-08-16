import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  BarChart3,
  BookOpen,
  Activity,
  FileText,
  User,
  CreditCard,
  Users,
  PieChart,
  Lightbulb,
  GraduationCap,
  Menu,
  X
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

// Mock user role - in real app this would come from auth context
const userRole: "student" | "teacher" | "admin" = "student"

const studentItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Assessments", url: "/assessments", icon: BookOpen },
  { title: "Activities", url: "/activities", icon: Activity },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Billing", url: "/billing", icon: CreditCard },
]

const teacherItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Students", url: "/students", icon: Users },
  { title: "Assessments", url: "/assessments", icon: BookOpen },
  { title: "Activities", url: "/activities", icon: Activity },
  { title: "Class Reports", url: "/class-reports", icon: PieChart },
  { title: "Lesson Generator", url: "/lesson-generator", icon: Lightbulb },
  { title: "Bulk Grading", url: "/bulk-grading", icon: GraduationCap },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Profile", url: "/profile", icon: User },
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const items = userRole === "teacher" || userRole === "admin" ? teacherItems : studentItems

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }

  const getNavClassName = ({ isActive: active }: { isActive: boolean }) =>
    cn(
      "w-full justify-start transition-all duration-200",
      active 
        ? "bg-primary text-primary-foreground shadow-lg" 
        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
    )

  return (
    <Sidebar className="glass-navigation border-r-0">
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-primary">Upraizen</h1>
              <p className="text-xs text-muted-foreground">ESPCheck Pro</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors lg:hidden"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName({ isActive: isActive(item.url) })}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role Badge */}
        {!collapsed && (
          <div className="mt-auto px-3 py-4">
            <div className="glass-card p-3 text-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {userRole === "teacher" ? "T" : "S"}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground capitalize">{userRole}</p>
              <p className="text-xs text-muted-foreground">Account</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}