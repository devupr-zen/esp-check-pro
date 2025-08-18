import type { LucideIcon } from "lucide-react"

export type Role = "student" | "teacher" | "superadmin"

export type NavItem = {
  href: string
  label: string
  icon?: LucideIcon
  roles?: Role[]
  feature?: keyof FeatureFlags
}

export type FeatureFlags = Partial<{
  invites: boolean
  assessments: boolean
  lessons: boolean
  reports: boolean
  activities: boolean
  progress: boolean
  settings: boolean
  admin: boolean
  students: boolean
  billing: boolean
}>

export const defaultFeatures: FeatureFlags = {
  invites: true, assessments: true, lessons: true, reports: true,
  activities: true, progress: true, settings: true, admin: true,
  students: true, billing: true,
}

import {
  LayoutDashboard, Users, ClipboardList, BookOpenCheck, BarChart3,
  Settings, Shield, CreditCard, UserPlus, Activity
} from "lucide-react"

export const teacherNav: NavItem[] = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["teacher","superadmin"] },
  { href: "/teacher/classes", label: "Classes", icon: Users, roles: ["teacher","superadmin"] },
  { href: "/teacher/students", label: "Students", icon: UserPlus, roles: ["teacher","superadmin"], feature: "students" },
  { href: "/teacher/invites", label: "Invites", icon: Shield, roles: ["teacher","superadmin"], feature: "invites" },
  { href: "/teacher/assessments", label: "Assessments", icon: ClipboardList, roles: ["teacher","superadmin"], feature: "assessments" },
  { href: "/teacher/lessons", label: "Lesson Plans", icon: BookOpenCheck, roles: ["teacher","superadmin"], feature: "lessons" },
  { href: "/teacher/reports", label: "Reports", icon: BarChart3, roles: ["teacher","superadmin"], feature: "reports" },
  { href: "/teacher/billing", label: "Billing", icon: CreditCard, roles: ["teacher","superadmin"], feature: "billing" },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["teacher","superadmin"], feature: "settings" },
]

export const studentNav: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["student","superadmin"] },
  { href: "/student/activities", label: "Activities", icon: Activity, roles: ["student","superadmin"], feature: "activities" },
  { href: "/student/assessments", label: "Assessments", icon: ClipboardList, roles: ["student","superadmin"], feature: "assessments" },
  { href: "/student/progress", label: "Progress", icon: BarChart3, roles: ["student","superadmin"], feature: "progress" },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["student","superadmin"], feature: "settings" },
]

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Admin", icon: Shield, roles: ["superadmin"], feature: "admin" },
  { href: "/teacher/dashboard", label: "Teacher View", icon: LayoutDashboard, roles: ["superadmin"] },
]

export function getNavForRole(role: Role, features: FeatureFlags = defaultFeatures): NavItem[] {
  const base = role === "teacher" ? teacherNav : role === "student" ? studentNav : adminNav
  return base.filter(i => (!i.roles || i.roles.includes(role)) && (!i.feature || features[i.feature] !== false))
}
