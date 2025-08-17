import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider"

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole: "teacher" | "student"
}

export function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role !== requiredRole) {
        // Redirect to correct dashboard based on user role
        const redirectPath = profile.role === "teacher" 
          ? "/teacher/dashboard" 
          : "/student/dashboard"
        navigate(redirectPath, { replace: true })
      }
    }
  }, [profile, loading, requiredRole, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile || profile.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}

export function requireRole(requiredRole: "teacher" | "student") {
  return function WrappedComponent(Component: React.ComponentType) {
    return function GuardedComponent(props: any) {
      return (
        <RouteGuard requiredRole={requiredRole}>
          <Component {...props} />
        </RouteGuard>
      )
    }
  }
}