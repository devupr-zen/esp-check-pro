// src/config/navigation.ts
import { LayoutDashboard, Users, ClipboardList, BookOpenCheck, FileText, BarChart3, Settings } from "lucide-react"

export const teacherNav = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/classes", label: "Classes", icon: Users },
  { href: "/teacher/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/teacher/lessons", label: "Lesson Plans", icon: BookOpenCheck },
  { href: "/teacher/reports", label: "Reports", icon: BarChart3 },
  { href: "/teacher/resources", label: "Resources", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

export const studentNav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/activities", label: "Activities", icon: BookOpenCheck },
  { href: "/student/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/student/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]
