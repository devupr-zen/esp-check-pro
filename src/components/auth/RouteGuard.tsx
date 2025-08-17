import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthProvider"

type Role = "teacher" | "student"

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole: Role
}

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { profile, loading } = useAuth()
  const location = useLocation()

  // 1) Still loading → show non-blocking loader (prevents flicker/blank)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // 2) Not authenticated or no profile yet → send to login with returnTo
  if (!profile) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  // 3) Unknown role → send to onboarding/track (or fallback to /settings)
  if (profile.role !== "teacher" && profile.role !== "student") {
    // Change to your real onboarding route if you have one
    return <Navigate to="/onboarding/track" replace />
  }

  // 4) Wrong role on this route → redirect to the correct dashboard
  if (profile.role !== requiredRole) {
    const redirectPath = profile.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"

    // Prevent loop: if we’re *already* at the “correct” root, just render children
    if (location.pathname.startsWith(redirectPath)) {
      return <>{children}</>
    }

    return <Navigate to={redirectPath} replace />
  }

  // 5) All good → render
  return <>{children}</>
}

// HOC convenience wrapper; usage: export default requireRole("teacher")(Page)
export function requireRole(requiredRole: Role) {
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
