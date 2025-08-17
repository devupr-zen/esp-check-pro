import { useState } from "react";
import { GlassCard } from "@/components/reusable/GlassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle, Calendar } from "lucide-react";

export default function StudentAssessments() {
  const [activeTab, setActiveTab] = useState("assigned");

  const assignedAssessments = [
    {
      id: 1,
      title: "Grammar Fundamentals Test",
      description: "Assessment covering basic grammar rules and sentence structure",
      dueDate: "2024-01-20",
      difficulty: "Beginner",
      estimatedTime: "30 minutes",
      type: "Quiz"
    },
    {
      id: 2,
      title: "Reading Comprehension Exercise",
      description: "Read passages and answer comprehension questions",
      dueDate: "2024-01-22",
      difficulty: "Intermediate",
      estimatedTime: "45 minutes",
      type: "Assignment"
    }
  ];

  const inProgressAssessments = [
    {
      id: 3,
      title: "Vocabulary Building Quiz",
      description: "Test your knowledge of advanced vocabulary",
      progress: 65,
      difficulty: "Advanced",
      type: "Quiz"
    }
  ];

  const completedAssessments = [
    {
      id: 4,
      title: "Basic Pronunciation Test",
      description: "Speaking assessment for pronunciation accuracy",
      completedDate: "2024-01-15",
      score: 92,
      difficulty: "Beginner",
      type: "Speaking"
    },
    {
      id: 5,
      title: "Writing Skills Assessment",
      description: "Essay writing with focus on structure and grammar",
      completedDate: "2024-01-12",
      score: 88,
      difficulty: "Intermediate",
      type: "Writing"
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Assessments</h1>
        <p className="text-muted-foreground">Track your assignments and progress</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4">
          <div className="grid gap-4">
            {assignedAssessments.map((assessment) => (
              <GlassCard key={assessment.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{assessment.title}</h3>
                      <Badge variant="outline">{assessment.type}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{assessment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {assessment.dueDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {assessment.estimatedTime}
                      </div>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(assessment.difficulty)}>
                    {assessment.difficulty}
                  </Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inprogress" className="space-y-4">
          <div className="grid gap-4">
            {inProgressAssessments.map((assessment) => (
              <GlassCard key={assessment.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-accent" />
                      <h3 className="text-lg font-semibold text-foreground">{assessment.title}</h3>
                      <Badge variant="outline">{assessment.type}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{assessment.description}</p>
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${assessment.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Progress: {assessment.progress}%</p>
                  </div>
                  <Badge className={getDifficultyColor(assessment.difficulty)}>
                    {assessment.difficulty}
                  </Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedAssessments.map((assessment) => (
              <GlassCard key={assessment.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{assessment.title}</h3>
                      <Badge variant="outline">{assessment.type}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{assessment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Completed: {assessment.completedDate}
                      </div>
                      <div className="text-primary font-semibold">
                        Score: {assessment.score}%
                      </div>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(assessment.difficulty)}>
                    {assessment.difficulty}
                  </Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}