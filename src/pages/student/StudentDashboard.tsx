import { GlassCard } from "@/components/reusable/GlassCard";
import { BarChart3, BookOpen, Activity, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your learning overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assessments</p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activities</p>
              <p className="text-2xl font-bold text-foreground">24</p>
            </div>
            <Activity className="h-8 w-8 text-accent" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold text-foreground">78%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Performance</p>
              <p className="text-2xl font-bold text-foreground">85%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-accent" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-accent/10">
              <p className="font-medium text-foreground">Grammar Exercise</p>
              <p className="text-sm text-muted-foreground">Completed • Score: 92%</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="font-medium text-foreground">Vocabulary Quiz</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-destructive/10">
              <p className="font-medium text-foreground">Essay Assignment</p>
              <p className="text-sm text-muted-foreground">Due: Tomorrow</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10">
              <p className="font-medium text-foreground">Speaking Practice</p>
              <p className="text-sm text-muted-foreground">Due: Friday</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}