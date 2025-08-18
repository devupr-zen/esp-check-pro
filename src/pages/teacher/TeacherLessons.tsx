import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { BookOpenCheck, Plus } from "lucide-react";
import { requireRole } from "@/components/auth/RouteGuard";

function TeacherLessons() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BookOpenCheck className="h-6 w-6" />
          Lesson Plans
        </h1>
        <div className="flex gap-2">
          <Button className="rounded-2xl">
            <Plus className="h-4 w-4 mr-1" />
            New lesson
          </Button>
        </div>
      </header>

      <GlassCard className="p-6">
        <h2 className="text-lg font-medium mb-2">Coming soon</h2>
        <p className="text-muted-foreground">
          Plan monthly/weekly lessons and attach activities. This page is a placeholder to
          satisfy routing and navigation. It follows current UI conventions (MainLayout + GlassCard).
        </p>
      </GlassCard>
    </div>
  );
}

export default requireRole("teacher")(TeacherLessons);
