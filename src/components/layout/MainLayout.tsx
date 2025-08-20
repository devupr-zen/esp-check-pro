// src/components/shell/MainLayout.tsx
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { AppShell } from "./AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

/** Minimal error boundary to prevent whole-app white screens */
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Route error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <strong className="text-destructive">Something went wrong.</strong>{" "}
            Try reloading or navigating to another page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface MainLayoutProps {
  children: React.ReactNode;
}

/** Lightweight banner that appears for teachers near/end of trial. */
function TeacherTrialBanner() {
  const { profile, user } = useAuth();
  const [status, setStatus] = useState<{
    status: string;
    trial_end: string;
    days_left: number;
  } | null>(null);
  const [hidden, setHidden] = useState(false);

  const isTeacher = profile?.role === "teacher";
  const storageKey = useMemo(
    () => (user ? `trialBanner:dismiss:${user.id}` : "trialBanner:dismiss"),
    [user]
  );

  useEffect(() => {
    // restore dismiss
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const { until } = JSON.parse(raw);
        if (until && new Date(until).getTime() > Date.now()) {
          setHidden(true);
        }
      } catch {
        // ignore
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isTeacher || !user) return;

    (async () => {
      // Prefer the view if it exists; otherwise compute fallback
      // 1) Try view public.teacher_subscription_status
      let data:
        | { status: string; trial_end: string; days_left: number }
        | null = null;

      try {
        const res = await supabase
          .from("teacher_subscription_status")
          .select("status, trial_end, days_left")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!res.error && res.data) {
          data = res.data as any;
        }
      } catch {
        // view may not exist; fall back
      }

      // 2) Fallback to table public.teacher_subscriptions
      if (!data) {
        try {
          const res = await supabase
            .from("teacher_subscriptions")
            .select("status, trial_end")
            .eq("user_id", user.id)
            .maybeSingle();
          if (!res.error && res.data?.trial_end) {
            const trialEnd = new Date(res.data.trial_end as any);
            const daysLeft = Math.max(
              0,
              Math.floor((trialEnd.getTime() - Date.now()) / 86400000)
            );
            data = {
              status: (res.data.status as string) ?? "trialing",
              trial_end: trialEnd.toISOString(),
              days_left: daysLeft,
            };
          }
        } catch {
          // table may not exist
        }
      }

      setStatus(data);
    })();
  }, [isTeacher, user]);

  if (!isTeacher || !status || hidden) return null;

  const isTrial = status.status === "trialing";
  const isExpired = status.status === "expired" || status.days_left <= 0;
  const show =
    isExpired || (isTrial && status.days_left <= 92 && status.days_left >= 0);

  if (!show) return null;

  const endDate = new Date(status.trial_end).toLocaleDateString();

  const dismissFor = (days: number) => {
    const until = new Date(Date.now() + days * 86400000).toISOString();
    localStorage.setItem(storageKey, JSON.stringify({ until }));
    setHidden(true);
  };

  return (
    <div
      className={`w-full px-4 py-2 border-b ${
        isExpired
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-amber-50 border-amber-200 text-amber-800"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="text-sm">
          {isExpired ? (
            <>
              Your teacher trial has <b>expired</b>. Please upgrade to keep
              creating classes and assignments.
            </>
          ) : (
            <>
              Your teacher trial ends on <b>{endDate}</b> —{" "}
              <b>{status.days_left}</b>{" "}
              day{status.days_left === 1 ? "" : "s"} left.
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant={isExpired ? "default" : "outline"}>
            {/* Replace /teacher/billing with your actual billing route/Stripe Checkout */}
            <a href="/teacher/billing">Upgrade</a>
          </Button>
          <button
            className="p-1.5 rounded hover:bg-black/5"
            aria-label="Dismiss"
            onClick={() => dismissFor(3)} // snooze for 3 days
            title="Dismiss for 3 days"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <AppShell>
      {/* Teacher trial banner appears on teacher routes if applicable */}
      <TeacherTrialBanner />

      <RouteErrorBoundary>
        <Suspense
          fallback={
            <div className="p-6">
              <div className="animate-pulse h-6 w-40 bg-muted rounded mb-3" />
              <div className="animate-pulse h-4 w-64 bg-muted rounded" />
            </div>
          }
        >
          {children}
        </Suspense>
      </RouteErrorBoundary>
    </AppShell>
  );
}
