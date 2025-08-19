// src/pages/superadmin/SuperAdminOverview.tsx
import { GlassCard } from "@/components/reusable/GlassCard";
import {
  Users,
  BookOpen,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// Later, you can import hooks like useQuery for live stats from Supabase

export default function SuperAdminOverview() {
  const navigate = useNavigate();

  // Example: Replace with Supabase stats in future
  const systemStats = [
    {
      label: "Total Users",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Active Teachers",
      value: "89",
      change: "+5%",
      icon: BookOpen,
      color: "text-accent",
    },
    {
      label: "Active Students",
      value: "1,158",
      change: "+15%",
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "System Health",
      value: "99.9%",
      change: "Optimal",
      icon: Shield,
      color: "text-accent",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      message: "New teacher registered: Dr. Sarah Wilson",
      time: "2 minutes ago",
      severity: "info",
    },
    {
      id: 2,
      message: "High CPU usage detected on server cluster 2",
      time: "15 minutes ago",
      severity: "warning",
    },
    {
      id: 3,
      message: "Premium subscription activated for Lincoln High School",
      time: "1 hour ago",
      severity: "success",
    },
    {
      id: 4,
      message: "Bulk student registration: 45 new students",
      time: "2 hours ago",
      severity: "info",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "warning":
        return "bg-destructive/20 text-destructive";
      case "success":
        return "bg-primary/20 text-primary";
      case "info":
        return "bg-accent/20 text-accent";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "success":
        return <TrendingUp className="h-4 w-4" />;
      case "info":
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor platform health, users, and system activity
        </p>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => (
          <GlassCard key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p
                  className={`text-xs font-medium ${
                    stat.change.startsWith("+") ? "text-primary" : "text-accent"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-card/50"
              >
                <div
                  className={`p-1 rounded-full ${getSeverityColor(
                    activity.severity
                  )}`}
                >
                  {getSeverityIcon(activity.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* System Health */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            System Health
          </h3>
          <div className="space-y-4">
            {[
              { label: "Server Performance", value: "Excellent", width: "95%" },
              { label: "Database Health", value: "Good", width: "88%" },
              { label: "Response Time", value: "142ms", width: "92%" },
              { label: "Uptime", value: "99.9%", width: "99%" },
            ].map((metric, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {metric.label}
                  </span>
                  <span className="text-sm text-primary">{metric.value}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: metric.width }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => navigate("/superadmin/users")}
            className="p-4 rounded-lg bg-primary/10 cursor-pointer hover:bg-primary/20 transition-colors"
          >
            <Users className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-foreground">Manage Users</p>
            <p className="text-sm text-muted-foreground">
              Add, edit, or remove users
            </p>
          </div>
          <div
            onClick={() => navigate("/superadmin/settings")}
            className="p-4 rounded-lg bg-accent/10 cursor-pointer hover:bg-accent/20 transition-colors"
          >
            <Settings className="h-6 w-6 text-accent mb-2" />
            <p className="font-medium text-foreground">System Settings</p>
            <p className="text-sm text-muted-foreground">
              Configure platform settings
            </p>
          </div>
          <div
            onClick={() => navigate("/superadmin/alerts")}
            className="p-4 rounded-lg bg-destructive/10 cursor-pointer hover:bg-destructive/20 transition-colors"
          >
            <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
            <p className="font-medium text-foreground">View Alerts</p>
            <p className="text-sm text-muted-foreground">Check system alerts</p>
          </div>
          <div
            onClick={() => navigate("/superadmin/analytics")}
            className="p-4 rounded-lg bg-primary/10 cursor-pointer hover:bg-primary/20 transition-colors"
          >
            <Activity className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-foreground">Analytics</p>
            <p className="text-sm text-muted-foreground">
              View detailed reports
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
