import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart3 } from "lucide-react";
import { requireRole } from "@/components/auth/RouteGuard";

function TeacherReports() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Reports
        </h1>
      </header>

      <GlassCard className="p-6">
        <h2 className="text-lg font-medium mb-2">Coming soon</h2>
        <p className="text-muted-foreground">
          Class analytics and student progress reports will appear here. This is a minimal placeholder
          to keep routing stable and aligned with <code>navigation.ts</code>.
        </p>
      </GlassCard>
    </div>
  );
}

export default requireRole("teacher")(TeacherReports);
