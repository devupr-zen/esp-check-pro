import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function TeacherAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // AuthProvider will route by role (→ /teacher/dashboard for teachers)
      navigate("/teacher/dashboard", { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    setErr(null);
    setLoading(true);
    try {
      // Sends a magic password reset email; ensure site_url is set in Supabase Auth settings
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/teacher`,
      });
      if (error) throw error;
      setErr("Check your inbox for a reset link.");
    } catch (e: any) {
      setErr(e?.message ?? "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left hero */}
      <div className="hidden md:flex bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-400 text-white items-center justify-center p-10">
        <div className="max-w-md">
          <Link to="/" className="inline-flex items-center mb-8 opacity-90 hover:opacity-100">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Upraizen ESPCheck Pro</h1>
          <p className="text-lg opacity-90">
            Teacher Portal – Create, manage, and track learner progress.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-gradient-to-b from-white to-slate-50">
        <Card className="w-full max-w-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Teacher Access</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Sign in with your email and password.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onForgot}
                    className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                    disabled={!email || loading}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {err && (
                <div
                  className={`text-sm ${err.includes("Check your inbox") ? "text-emerald-600" : "text-red-600"}`}
                  role="alert"
                >
                  {err}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Continue"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground mt-6">
              Need access?{" "}
              <Link to="/redeem" className="text-indigo-600 hover:underline">
                Redeem your invite
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
