import { GlassCard } from "@/components/reusable/GlassCard";
import { MetricChip } from "@/components/reusable/MetricChip";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, CreditCard, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalStudents: number;
  activeClasses: number;
  totalAssessments: number;
  avgProgress: number;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeClasses: 0,
    totalAssessments: 0,
    avgProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.user_id) return;

      try {
        // Get classes count
        const { data: classes, error: classesError } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', profile.user_id)
          .eq('is_active', true);

        if (classesError) throw classesError;

        // Get total students across all classes
        const { data: students, error: studentsError } = await supabase
          .from('class_members')
          .select('student_id')
          .in('class_id', classes?.map(c => c.id) || [])
          .eq('status', 'active');

        if (studentsError) throw studentsError;

        const uniqueStudents = new Set(students?.map(s => s.student_id) || []).size;

        setStats({
          totalStudents: uniqueStudents,
          activeClasses: classes?.length || 0,
          totalAssessments: 0, // TODO: Add assessments table
          avgProgress: 85, // TODO: Calculate from actual data
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile?.user_id, toast]);

  const dashboardCards = [
    {
      title: "Students",
      value: stats.totalStudents,
      icon: Users,
      description: "Active students across all classes",
      action: () => navigate('/teacher/students'),
      actionLabel: "Manage Students",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Assessments",
      value: stats.totalAssessments,
      icon: BookOpen,
      description: "Total assessments created",
      action: () => navigate('/teacher/assessments'),
      actionLabel: "View Assessments",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Plan",
      value: "Pro",
      icon: TrendingUp,
      description: "Current subscription plan",
      action: () => navigate('/teacher/billing'),
      actionLabel: "Manage Plan",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Billing",
      value: "$29",
      icon: CreditCard,
      description: "Monthly subscription",
      action: () => navigate('/teacher/billing'),
      actionLabel: "View Billing",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.first_name}! Here's an overview of your teaching activities.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card) => (
          <GlassCard key={card.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <MetricChip 
                label={card.title}
                value={typeof card.value === 'number' ? card.value : 0} 
                trend="up" 
              />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-foreground mb-2">
              {loading ? "..." : card.value}
            </p>
            <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={card.action}
              className="w-full"
              disabled={loading}
            >
              {card.actionLabel}
            </Button>
          </GlassCard>
        ))}
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => navigate('/teacher/students')}
            className="h-auto p-4 flex-col items-start space-y-2"
            variant="outline"
          >
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Invite Student</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Send email invitations to new students
            </p>
          </Button>
          
          <Button 
            onClick={() => navigate('/teacher/assessments')}
            className="h-auto p-4 flex-col items-start space-y-2"
            variant="outline"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">Create Assessment</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Design new assessments for your students
            </p>
          </Button>
          
          <Button 
            onClick={() => navigate('/teacher/students')}
            className="h-auto p-4 flex-col items-start space-y-2"
            variant="outline"
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">View Progress</span>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              Check student performance and progress
            </p>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}