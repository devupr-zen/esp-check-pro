// src/config/navigation.ts
import type { LucideIcon } from "lucide-react";

export type Role = "student" | "teacher" | "superadmin";

export type NavItem = {
	href: string;
	label: string;
	icon?: LucideIcon;
	roles?: Role[];
	feature?: keyof FeatureFlags;
};

export type FeatureFlags = Partial<{
	invites: boolean;
	assessments: boolean;
	lessons: boolean;
	reports: boolean;
	activities: boolean;
	progress: boolean;
	settings: boolean;
	admin: boolean;
	students: boolean;
	billing: boolean;
}>;

export const defaultFeatures: FeatureFlags = {
	invites: true,
	assessments: true,
	lessons: true,
	reports: true,
	activities: true,
	progress: true,
	settings: true,
	admin: true,
	students: true,
	billing: true,
};

import {
	Activity,
	BarChart3,
	BookOpenCheck,
	ClipboardList,
	CreditCard,
	LayoutDashboard,
	Settings,
	Shield,
	UserPlus,
	Users,
} from "lucide-react";

/**
 * Teacher navigation
 * - scoped to /teacher/*
 * - Settings remains global at /settings (matches repo pages/Settings.tsx)
 */
export const teacherNav: NavItem[] = [
	{
		href: "/teacher/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
		roles: ["teacher", "superadmin"],
	},
	{
		href: "/teacher/classes",
		label: "Classes",
		icon: Users,
		roles: ["teacher", "superadmin"],
	},
	{
		href: "/teacher/students",
		label: "Students",
		icon: UserPlus,
		roles: ["teacher", "superadmin"],
		feature: "students",
	},
	{
		href: "/teacher/invites",
		label: "Invites",
		icon: Shield,
		roles: ["teacher", "superadmin"],
		feature: "invites",
	},
	{
		href: "/teacher/assessments",
		label: "Assessments",
		icon: ClipboardList,
		roles: ["teacher", "superadmin"],
		feature: "assessments",
	},
	{
		href: "/teacher/lessons",
		label: "Lesson Plans",
		icon: BookOpenCheck,
		roles: ["teacher", "superadmin"],
		feature: "lessons",
	},
	{
		href: "/teacher/reports",
		label: "Reports",
		icon: BarChart3,
		roles: ["teacher", "superadmin"],
		feature: "reports",
	},
	{
		href: "/teacher/billing",
		label: "Billing",
		icon: CreditCard,
		roles: ["teacher", "superadmin"],
		feature: "billing",
	},
	{
		href: "/settings",
		label: "Settings",
		icon: Settings,
		roles: ["teacher", "superadmin"],
		feature: "settings",
	},
];

/**
 * Student navigation
 * - scoped to /student/*
 * - Settings remains global at /settings (matches repo pages/Settings.tsx)
 */
export const studentNav: NavItem[] = [
	{
		href: "/student/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
		roles: ["student", "superadmin"],
	},
	{
		href: "/student/activities",
		label: "Activities",
		icon: Activity,
		roles: ["student", "superadmin"],
		feature: "activities",
	},
	{
		href: "/student/assessments",
		label: "Assessments",
		icon: ClipboardList,
		roles: ["student", "superadmin"],
		feature: "assessments",
	},
	{
		href: "/student/progress",
		label: "Progress",
		icon: BarChart3,
		roles: ["student", "superadmin"],
		feature: "progress",
	},
	{
		href: "/settings",
		label: "Settings",
		icon: Settings,
		roles: ["student", "superadmin"],
		feature: "settings",
	},
];

/**
 * Superadmin navigation
 * - canonical home is /superadmin (aligns with RouteGuard)
 * - includes a convenience link to legacy /admin if you still have it
 */
export const adminNav: NavItem[] = [
	{
		href: "/superadmin",
		label: "Admin Overview",
		icon: Shield,
		roles: ["superadmin"],
		feature: "admin",
	},
	{
		href: "/superadmin/users",
		label: "Users",
		icon: Users,
		roles: ["superadmin"],
		feature: "admin",
	},
	{
		href: "/superadmin/reports",
		label: "Reports",
		icon: BarChart3,
		roles: ["superadmin"],
		feature: "admin",
	},
	// Optional legacy link — remove if you do not use /admin anymore:
	{
		href: "/admin",
		label: "Legacy Admin",
		icon: Shield,
		roles: ["superadmin"],
		feature: "admin",
	},
];

/**
 * Returns a role-scoped, feature-filtered navigation list.
 * Use inside Sidebar or shells to avoid cross-link leakage.
 */
export function getNavForRole(
	role: Role,
	features: FeatureFlags = defaultFeatures,
): NavItem[] {
	const base =
		role === "teacher"
			? teacherNav
			: role === "student"
				? studentNav
				: adminNav;

	return base.filter(
		(i) =>
			(!i.roles || i.roles.includes(role)) &&
			(!i.feature || features[i.feature] !== false),
	);
}
