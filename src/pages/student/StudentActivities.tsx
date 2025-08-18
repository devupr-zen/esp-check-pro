import { GlassCard } from "@/components/GlassCard";
import { Activity } from "lucide-react";
import { requireRole } from "@/components/auth/RouteGuard";

export default function StudentActivities() {
function StudentActivities() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Activities
        </h1>
      </header>

      <GlassCard className="p-6">
        <h2 className="text-lg font-medium mb-2">Coming soon</h2>
        <p className="text-muted-foreground">
          Your assigned activities will appear here. This placeholder keeps the student navigation working
          and prevents routing gaps flagged by Lovable.
        </p>
      </GlassCard>
    </div>
  );
}

export default requireRole("student")(StudentActivities);
