import React, { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export type Role = 'teacher' | 'student' | 'superadmin';

interface RouteGuardProps {
  requireRole?: Role;
}

// Default export (component)
export default function RouteGuard({
  requireRole,
  children,
}: PropsWithChildren<RouteGuardProps>) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking access…</span>
      </div>
    );
  }

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    const authPath =
      requireRole === 'teacher'
        ? '/auth/teacher'
        : requireRole === 'superadmin'
        ? '/auth/superadmin'
        : '/auth/student';
    return <Navigate to={`${authPath}?returnTo=${returnTo}`} replace />;
  }

  if (requireRole) {
    const role = (profile?.role as Role | undefined) ?? 'student';
    const roleMatches =
      role === requireRole ||
      (role === 'superadmin' && (requireRole === 'teacher' || requireRole === 'student'));

    if (!roleMatches) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

/* ------------------------------------------------------------------
   Backward-compatibility shims so both styles compile:

     import RouteGuard from '@/components/auth/RouteGuard'
     import { RouteGuard, requireRole } from '@/components/auth/RouteGuard'

------------------------------------------------------------------- */
export { RouteGuard }; // named export of the default component
export const requireRole = (_role: Role) => undefined;
