import { GlassCard } from "@/components/reusable/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Users, Calendar, Clock, BarChart3 } from "lucide-react";

export default function TeacherAssessments() {
  const assessments = [
    {
      id: 1,
      title: "Grammar Fundamentals Test",
      description: "Assessment covering basic grammar rules and sentence structure",
      type: "Quiz",
      difficulty: "Beginner",
      students: 32,
      submitted: 28,
      pending: 4,
      dueDate: "2024-01-20",
      status: "Active"
    },
    {
      id: 2,
      title: "Reading Comprehension Exercise",
      description: "Read passages and answer comprehension questions",
      type: "Assignment",
      difficulty: "Intermediate",
      students: 25,
      submitted: 25,
      pending: 0,
      dueDate: "2024-01-18",
      status: "Completed"
    },
    {
      id: 3,
      title: "Business Vocabulary Quiz",
      description: "Test knowledge of business-related terminology",
      type: "Quiz",
      difficulty: "Advanced",
      students: 18,
      submitted: 12,
      pending: 6,
      dueDate: "2024-01-22",
      status: "Active"
    },
    {
      id: 4,
      title: "Essay Writing Assessment",
      description: "500-word essay on professional communication",
      type: "Writing",
      difficulty: "Intermediate",
      students: 30,
      submitted: 0,
      pending: 30,
      dueDate: "2024-01-25",
      status: "Draft"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-primary/20 text-primary";
      case "Intermediate": return "bg-accent/20 text-accent";
      case "Advanced": return "bg-destructive/20 text-destructive";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-primary/20 text-primary";
      case "Completed": return "bg-accent/20 text-accent";
      case "Draft": return "bg-muted/20 text-muted-foreground";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Quiz": return <BookOpen className="h-4 w-4" />;
      case "Assignment": return <Calendar className="h-4 w-4" />;
      case "Writing": return <BarChart3 className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
          <p className="text-muted-foreground">Create and manage student assessments</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      <div className="grid gap-6">
        {assessments.map((assessment) => (
          <GlassCard key={assessment.id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getTypeIcon(assessment.type)}
                  <h3 className="text-lg font-semibold text-foreground">{assessment.title}</h3>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {assessment.type}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-4">{assessment.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Badge className={getDifficultyColor(assessment.difficulty)}>
                    {assessment.difficulty}
                  </Badge>
                  <Badge className={getStatusColor(assessment.status)}>
                    {assessment.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Due: {assessment.dueDate}
                  </div>
                </div>
              </div>

              <div className="lg:w-80 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">{assessment.students}</p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/10">
                    <div className="flex items-center justify-center mb-1">
                      <BarChart3 className="h-4 w-4 text-accent" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">{assessment.submitted}</p>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 text-destructive" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">{assessment.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}