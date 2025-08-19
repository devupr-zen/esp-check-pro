// src/pages/Landing.tsx
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/reusable/GlassCard";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  // If already authenticated, send users straight to their dashboard
  useEffect(() => {
    if (loading) return;
    if (!profile) return;
    const role = profile.role;
    if (role === "teacher") {
      navigate("/teacher/dashboard", { replace: true });
    } else if (role === "superadmin") {
      navigate("/superadmin", { replace: true });
    } else {
      navigate("/student/dashboard", { replace: true });
    }
  }, [profile, loading, navigate]);

  const go = (path: string) => () => navigate(path);
  const onKey = (path: string) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Upraizen ESPCheck Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium assessment platform for enhanced learning experiences
          </p>
        </header>

        {/* Student + Teacher Options */}
        <section className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Student */}
          <GlassCard
            className="p-8 text-center hover:scale-105 transition-transform duration-200 focus-within:ring-2 focus-within:ring-primary/40 outline-none cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="Continue as Student"
            onClick={go("/auth/student")}
            onKeyDown={onKey("/auth/student")}
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <GraduationCap className="w-10 h-10 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Student</h2>
              <p className="text-muted-foreground">
                Access assessments, track progress, and enhance your learning journey
              </p>
            </div>
            <Button className="w-full" size="lg">
              Continue as Student
            </Button>
          </GlassCard>

          {/* Teacher */}
          <GlassCard
            className="p-8 text-center hover:scale-105 transition-transform duration-200 focus-within:ring-2 focus-within:ring-primary/40 outline-none cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="Continue as Teacher"
            onClick={go("/auth/teacher")}
            onKeyDown={onKey("/auth/teacher")}
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="w-10 h-10 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Teacher</h2>
              <p className="text-muted-foreground">
                Create lessons, manage students, and track class performance
              </p>
            </div>
            <Button className="w-full" size="lg">
              Continue as Teacher
            </Button>
          </GlassCard>
        </section>

        {/* Administrator Access → only visible to superadmins */}
        {profile?.role === "superadmin" && (
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={go("/superadmin")}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Administrator access"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Administrator Access
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
