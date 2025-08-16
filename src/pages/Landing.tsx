import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/reusable/GlassCard";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Upraizen ESPCheck Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium assessment platform for enhanced learning experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <GlassCard className="p-8 text-center hover:scale-105 transition-transform cursor-pointer">
            <div className="mb-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Student</h2>
              <p className="text-muted-foreground">
                Access assessments, track progress, and enhance your learning journey
              </p>
            </div>
            <Button 
              onClick={() => navigate('/auth/student')}
              className="w-full"
              size="lg"
            >
              Continue as Student
            </Button>
          </GlassCard>

          <GlassCard className="p-8 text-center hover:scale-105 transition-transform cursor-pointer">
            <div className="mb-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Teacher</h2>
              <p className="text-muted-foreground">
                Create lessons, manage students, and track class performance
              </p>
            </div>
            <Button 
              onClick={() => navigate('/auth/teacher')}
              className="w-full"
              size="lg"
            >
              Continue as Teacher
            </Button>
          </GlassCard>
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth/superadmin')}
            className="text-muted-foreground hover:text-foreground"
          >
            Administrator Access
          </Button>
        </div>
      </div>
    </div>
  );
}