import { GlassCard } from "@/components/reusable/GlassCard";
import { Users, BookOpen, Activity, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Manage your classes and track student progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground">42</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Assessments</p>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
            <BookOpen className="h-8 w-8 text-accent" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
              <p className="text-2xl font-bold text-foreground">15</p>
            </div>
            <Clock className="h-8 w-8 text-destructive" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Class Average</p>
              <p className="text-2xl font-bold text-foreground">84%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="font-medium text-foreground">Grammar Test Submissions</p>
              <p className="text-sm text-muted-foreground">12 new submissions • 2 hours ago</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10">
              <p className="font-medium text-foreground">Speaking Assessment</p>
              <p className="text-sm text-muted-foreground">5 students completed • 4 hours ago</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <p className="font-medium text-foreground">Assignment Due Tomorrow</p>
              <p className="text-sm text-muted-foreground">Essay Writing - 8 submissions pending</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Students</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <div>
                <p className="font-medium text-foreground">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">Business English Track</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">96%</p>
                <p className="text-xs text-muted-foreground">Overall</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
              <div>
                <p className="font-medium text-foreground">Mike Chen</p>
                <p className="text-sm text-muted-foreground">General English Track</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-accent">94%</p>
                <p className="text-xs text-muted-foreground">Overall</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <div>
                <p className="font-medium text-foreground">Emma Davis</p>
                <p className="text-sm text-muted-foreground">Business English Track</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">92%</p>
                <p className="text-xs text-muted-foreground">Overall</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 cursor-pointer hover:bg-primary/20 transition-colors">
            <BookOpen className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-foreground">Create Assessment</p>
            <p className="text-sm text-muted-foreground">Design new tests and quizzes</p>
          </div>
          <div className="p-4 rounded-lg bg-accent/10 cursor-pointer hover:bg-accent/20 transition-colors">
            <Users className="h-6 w-6 text-accent mb-2" />
            <p className="font-medium text-foreground">Manage Students</p>
            <p className="text-sm text-muted-foreground">View student progress</p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 cursor-pointer hover:bg-destructive/20 transition-colors">
            <Activity className="h-6 w-6 text-destructive mb-2" />
            <p className="font-medium text-foreground">Generate Reports</p>
            <p className="text-sm text-muted-foreground">Class performance analytics</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}