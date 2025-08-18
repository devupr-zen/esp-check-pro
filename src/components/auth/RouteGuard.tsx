import React, { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

type Role = 'teacher' | 'student' | 'superadmin';

interface RouteGuardProps {
  requireRole?: Role;
}

export default function RouteGuard({
  requireRole,
  children,
}: PropsWithChildren<RouteGuardProps>) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // While auth is resolving, show a tiny spinner (prevents flicker)
  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking access…</span>
      </div>
    );
  }

  // Not signed in → send to the correct auth page with returnTo
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

  // If a role is required, enforce it (superadmin bypass for teacher/student)
  if (requireRole) {
    const role = (profile?.role as Role | undefined) ?? 'student';
    const roleMatches =
      role === requireRole ||
      (role === 'superadmin' && (requireRole === 'teacher' || requireRole === 'student'));

    if (!roleMatches) {
      // Signed in but wrong role → send to a safe landing (your main dashboard)
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Authorized
  return <>{children}</>;
}
