// src/components/auth/requireRole.tsx
import React from "react";
import RouteGuard, { type Role } from "@/components/auth/RouteGuard";

/**
 * Higher-order component (HOC) for role-guarding entire components.
 *
 * Example:
 *   export default requireRole("teacher")(TeacherDashboard)
 */
export const requireRole = (role: Role) =>
  function withGuard<P>(Component: React.ComponentType<P>) {
    return function Guarded(props: P) {
      return (
        <RouteGuard requireRole={role}>
          <Component {...props} />
        </RouteGuard>
      );
    };
  };

/**
 * Wrapper component version for JSX usage.
 *
 * Example:
 *   <RequireRole role="student">
 *     <StudentDashboard />
 *   </RequireRole>
 */
type Props = {
  role: Role; // renamed to match RouteGuard
  children: React.ReactNode;
};

export default function RequireRole({ role, children }: Props) {
  return <RouteGuard requireRole={role}>{children}</RouteGuard>;
}
