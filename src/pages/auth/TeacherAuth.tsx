// src/pages/auth/TeacherAuth.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type AuthStep = "signin" | "signup" | "reset";

type ValidateInviteRow = {
  ok: boolean;
  invite_id: string | null;
  expires_at: string | null;
};

export default function TeacherAuth() {
  const [step, setStep] = useState<AuthStep>("signin");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
    firstName: "",
    lastName: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();

  const redirectBase = `${window.location.origin}/auth/callback`;
  const teacherHome = "/teacher/dashboard";

  async function upsertTeacherProfile(userId: string, email: string | null) {
    await supabase.from("profiles").upsert(
      {
        id: userId,
        email: email ?? null, // keep NOT NULL happy
        role: "teacher",
        full_name:
          [formData.firstName, formData.lastName].filter(Boolean).join(" ") || null,
        is_active: true, // if column exists
      },
      { onConflict: "id" }
    );
  }

  useEffect(() => {
    // remember intended route
    const intended = params.get("returnTo");
    localStorage.setItem("upraizenRole", "teacher");
    if (intended) localStorage.setItem("returnTo", intended);

    // if already signed in, send to teacher home
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      await upsertTeacherProfile(session.user.id, session.user.email);

      const returnTo = localStorage.getItem("returnTo");
      if (returnTo && returnTo.startsWith("/teacher")) {
        localStorage.removeItem("returnTo");
        navigate(returnTo, { replace: true });
      } else {
        navigate(teacherHome, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- SIGN IN (email + password) ---------------- */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });
      if (error) throw error;

      if (data.user) await upsertTeacherProfile(data.user.id, data.user.email);

      const returnTo = localStorage.getItem("returnTo");
      if (returnTo && returnTo.startsWith("/teacher")) {
        localStorage.removeItem("returnTo");
        navigate(returnTo, { replace: true });
      } else {
        navigate(teacherHome, { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      toast({ title: "Unable to sign in", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGN UP (invite + password) ---------------- */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords are identical.",
          variant: "destructive",
        });
        return;
      }

      // 1) Validate invite via RPC
      const rpc = await supabase.rpc("validate_teacher_invite", {
        p_email: formData.email.trim(),
        p_code: formData.inviteCode.trim(),
      });
      const rows = (rpc.data ?? []) as ValidateInviteRow[];
      const row = rows?.[0];

      if (rpc.error || !row?.ok || !row.invite_id) {
        toast({
          title: "Invalid invite",
          description: "Check your email and invite code.",
          variant: "destructive",
        });
        return;
      }
      if (row.expires_at && new Date(row.expires_at) < new Date()) {
        toast({
          title: "Invite expired",
          description: "Ask your admin for a new invite.",
          variant: "destructive",
        });
        return;
      }

      // 2) Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${redirectBase}?returnTo=${encodeURIComponent(teacherHome)}`,
          data: {
            role: "teacher",
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });
      if (authError) throw authError;

      // 3) Ensure profile + mark invite used
      if (authData.user) {
        await upsertTeacherProfile(authData.user.id, authData.user.email);
      }
      await supabase
        .from("teacher_credentials")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("id", row.invite_id);

      toast({ title: "Account created", description: "Check your email to verify your account." });
      navigate(teacherHome, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-up failed";
      toast({ title: "Unable to sign up", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RESET PASSWORD ---------------- */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
        redirectTo: `${redirectBase}?returnTo=/auth/reset`,
      });
      if (error) throw error;
      toast({ title: "Reset email sent", description: "Check your inbox." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-5xl font-bold mb-6">Upraizen ESPCheck Pro</h1>
          <p className="text-xl text-center max-w-md">
            Teacher Portal - Create, manage, and track progress
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {step === "signin" && "Teacher Access"}
                {step === "signup" && "Teacher Sign Up"}
                {step === "reset" && "Reset Password"}
              </h2>
              <p className="text-muted-foreground">
                {step === "signin" && "Enter your email and password to sign in"}
                {step === "signup" && "Create your account with invite code"}
                {step === "reset" && "Enter your email to reset your password"}
              </p>
            </div>

            {/* --------- SIGN IN --------- */}
            {step === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="teacher@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Signing in..." : "Continue"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setStep("reset")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("signup")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    New here? Sign up
                  </button>
                </div>
              </form>
            )}

            {/* --------- SIGN UP --------- */}
            {step === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="teacher@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="inviteCode"
                      type={showInvite ? "text" : "password"}
                      placeholder="Paste your invite code"
                      value={formData.inviteCode}
                      onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowInvite(!showInvite)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showInvite ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("signin")}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            )}

            {/* --------- RESET --------- */}
            {step === "reset" && (
              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="teacher@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("signin")}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
