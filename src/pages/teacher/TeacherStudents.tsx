import { GlassCard } from "@/components/reusable/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User, Mail, BookOpen, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function TeacherStudents() {
  const [searchTerm, setSearchTerm] = useState("");

  const students = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      track: "Business English",
      progress: 96,
      assignments: 12,
      completed: 11,
      lastActive: "Today"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike.chen@email.com",
      track: "General English",
      progress: 94,
      assignments: 10,
      completed: 10,
      lastActive: "Yesterday"
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma.davis@email.com",
      track: "Business English",
      progress: 92,
      assignments: 12,
      completed: 10,
      lastActive: "2 days ago"
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      email: "alex.rodriguez@email.com",
      track: "General English",
      progress: 88,
      assignments: 9,
      completed: 8,
      lastActive: "Today"
    },
    {
      id: 5,
      name: "Lisa Wang",
      email: "lisa.wang@email.com",
      track: "Business English",
      progress: 85,
      assignments: 11,
      completed: 9,
      lastActive: "3 days ago"
    }
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.track.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-primary";
    if (progress >= 80) return "text-accent";
    return "text-destructive";
  };

  const getTrackColor = (track: string) => {
    return track === "Business English" 
      ? "bg-primary/20 text-primary" 
      : "bg-accent/20 text-accent";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground">Manage and track your students' progress</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <GlassCard key={student.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{student.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 mr-1" />
                    {student.email}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Track:</span>
                <Badge className={getTrackColor(student.track)}>
                  {student.track}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className={`font-semibold ${getProgressColor(student.progress)}`}>
                    {student.progress}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${student.progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assignments:</span>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {student.completed}/{student.assignments}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Last active:</span>
                <span className="text-xs font-medium text-foreground">{student.lastActive}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "No students have been enrolled yet"}
          </p>
        </div>
      )}
    </div>
  );
}