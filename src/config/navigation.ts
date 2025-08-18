// Single source of truth for all role-based navigation.
// Safe even if some routes don't exist yet (see feature flags).

import type { ComponentType } from "react"

// Keep roles explicit
export type Role = "student" | "teacher" | "superadmin"

export type NavItem = {
  href: string
  label: string
  icon?: ComponentType<{ className?: string }>
  roles?: Role[]              // if omitted => visible to all roles
  feature?: keyof FeatureFlags // optional gating by feature flag
}

// Optional feature flags (turn items on/off without touching code)
export type FeatureFlags = Partial<{
  invites: boolean
  assessments: boolean
  lessons: boolean
  reports: boolean
  activities: boolean
  progress: boolean
  settings: boolean
  admin: boolean
}>

// Default flags: everything on
export const defaultFeatures: FeatureFlags = {
  invites: true,
  assessments: true,
  lessons: true,
  reports: true,
  activities: true,
  progress: true,
  settings: true,
  admin: true,
}

// inside teacherNav in src/config/navigation.ts
import { Users, CreditCard, UserPlus } from "lucide-react"
// ...
{ href: "/teacher/students", label: "Students", icon: UserPlus, roles: ["teacher","superadmin"] },
{ href: "/teacher/billing", label: "Billing", icon: CreditCard, roles: ["teacher","superadmin"] },

// Lucide icons – keep imports local so code splits nicely
import {
  LayoutDashboard, Users, ClipboardList, BookOpenCheck,
  BarChart3, Settings, Shield
} from "lucide-react"

// Teacher nav
export const teacherNav: NavItem[] = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["teacher","superadmin"] },
  { href: "/teacher/classes", label: "Classes", icon: Users, roles: ["teacher","superadmin"] },
  { href: "/teacher/invites", label: "Invites", icon: Shield, roles: ["teacher","superadmin"], feature: "invites" },
  { href: "/teacher/assessments", label: "Assessments", icon: ClipboardList, roles: ["teacher","superadmin"], feature: "assessments" },
  { href: "/teacher/lessons", label: "Lesson Plans", icon: BookOpenCheck, roles: ["teacher","superadmin"], feature: "lessons" },
  { href: "/teacher/reports", label: "Reports", icon: BarChart3, roles: ["teacher","superadmin"], feature: "reports" },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["teacher","superadmin"], feature: "settings" },
]

// Student nav
export const studentNav: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["student","superadmin"] },
  { href: "/student/activities", label: "Activities", icon: BookOpenCheck, roles: ["student","superadmin"], feature: "activities" },
  { href: "/student/assessments", label: "Assessments", icon: ClipboardList, roles: ["student","superadmin"], feature: "assessments" },
  { href: "/student/progress", label: "Progress", icon: BarChart3, roles: ["student","superadmin"], feature: "progress" },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["student","superadmin"], feature: "settings" },
]

// Superadmin shortcuts (optional)
export const adminNav: NavItem[] = [
  { href: "/admin", label: "Admin", icon: Shield, roles: ["superadmin"], feature: "admin" },
  { href: "/teacher/dashboard", label: "Teacher View", icon: LayoutDashboard, roles: ["superadmin"] },
]

// Helper: get the right menu for a role and feature flags
export function getNavForRole(role: Role, features: FeatureFlags = defaultFeatures): NavItem[] {
  const base = role === "teacher" ? teacherNav : role === "student" ? studentNav : adminNav
  return base.filter(item => {
    const roleOK = !item.roles || item.roles.includes(role)
    const featureOK = !item.feature || features[item.feature] !== false
    return roleOK && featureOK
  })
}
