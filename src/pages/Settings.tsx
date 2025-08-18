import { GlassCard } from "@/components/GlassCard";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
      </header>

      <GlassCard className="p-6">
        <h2 className="text-lg font-medium mb-2">Coming soon</h2>
        <p className="text-muted-foreground">
          Profile, notifications, and preferences will live here. This page exists to keep the
          <code> /settings </code> route functional across roles.
        </p>
      </GlassCard>
    </div>
  );
}
