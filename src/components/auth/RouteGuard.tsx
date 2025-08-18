import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthProvider"

type Role = "teacher" | "student" | "superadmin"

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole: Exclude<Role, "superadmin"> // keep API: pages require "teacher" or "student"
}

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { profile, loading } = useAuth()
  const location = useLocation()

  // 1) Loading → show lightweight spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // 2) Not authenticated → to login with returnTo
  if (!profile) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  const role = profile.role as Role | undefined

  // 3) Unknown role → onboarding/track (adjust if you have a different route)
  if (!role) {
    return <Navigate to="/onboarding/track" replace />
  }

  // 4) Superadmin can access either teacher or student views
  if (role === "superadmin") {
    return <>{children}</>
  }

  // 5) Wrong role → redirect to correct dashboard
  if (role !== requiredRole) {
    const redirectPath = role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"
    if (location.pathname.startsWith(redirectPath)) {
      return <>{children}</>
    }
    return <Navigate to={redirectPath} replace />
  }

  // 6) All good
  return <>{children}</>
}

// HOC convenience wrapper; usage: export default requireRole("teacher")(Page)
export function requireRole(requiredRole: Exclude<Role, "superadmin">) {
  return function withGuard<P>(Component: React.ComponentType<P>) {
    return function GuardedComponent(props: P) {
      return (
        <RouteGuard requiredRole={requiredRole}>
          <Component {...props} />
        </RouteGuard>
      )
    }
  }
}
