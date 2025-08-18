import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart3 } from "lucide-react";
import { requireRole } from "@/components/auth/RouteGuard";

function StudentProgress() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Progress
        </h1>
      </header>

      <GlassCard className="p-6">
        <h2 className="text-lg font-medium mb-2">Coming soon</h2>
        <p className="text-muted-foreground">
          Charts and milestones to track your learning progress will be shown here. This is a minimal, on-brand placeholder.
        </p>
      </GlassCard>
    </div>
  );
}

export default requireRole("student")(StudentProgress);
