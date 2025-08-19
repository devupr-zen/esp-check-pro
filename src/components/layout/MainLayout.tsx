// src/components/shell/MainLayout.tsx (or keep your current path)
import React, { Suspense } from "react";
import { AppShell } from "./AppShell";

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

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <AppShell>
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
