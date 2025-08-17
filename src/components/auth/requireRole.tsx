// src/components/auth/requireRole.tsx
import React from "react"
import { RouteGuard } from "./RouteGuard"

export const requireRole = (requiredRole: "teacher" | "student") =>
  function withGuard<P>(Component: React.ComponentType<P>) {
    return function Guarded(props: P) {
      return (
        <RouteGuard requiredRole={requiredRole}>
          <Component {...props} />
        </RouteGuard>
      )
    }
  }
