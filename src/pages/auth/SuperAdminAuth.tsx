// src/pages/auth/SuperAdminAuth.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Shield, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const superadminHome = "/superadmin";

export default function SuperAdminAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sign-in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Redeem code state
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  /* -------------------- SIGN IN (email + password) -------------------- */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      // Ensure profile exists & has at least an email (role can be added later)
      if (data.user) {
        await supabase
          .from("profiles")
          .upsert(
            {
              id: data.user.id,
              email: data.user.email ?? null,
            },
            { onConflict: "id" }
          );
      }

      toast({ title: "Welcome back", description: "Signed in successfully." });
      navigate(superadminHome, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to sign in";
      toast({ title: "Sign-in failed", description: msg, variant: "destructive" });
    } finally {
      setSigningIn(false);
    }
  };

  /* -------------------- REDEEM ACCESS CODE (promote to superadmin) -------------------- */
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeeming(true);
    try {
      // Validate an active code
      const { data: codeRow, error: codeErr } = await supabase
        .from("superadmin_codes")
        .select("id, code, is_active")
        .eq("code", code.trim())
        .eq("is_active", true)
        .maybeSingle();

      if (codeErr || !codeRow) {
        toast({
          title: "Invalid code",
          description: "Please check the code or contact an existing admin.",
          variant: "destructive",
        });
        return;
      }

      // Must be signed in to promote
      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Sign in first, then redeem the access code.",
          variant: "destructive",
        });
        return;
      }

      // Promote profile to superadmin
      const { error: upErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? null,
            role: "superadmin",
            is_active: true,
          },
          { onConflict: "id" }
        );
      if (upErr) throw upErr;

      // (Optional) If you want one-time codes, you can deactivate here:
      // await supabase.from("superadmin_codes").update({ is_active: false }).eq("id", codeRow.id);

      toast({ title: "Access granted", description: "You are now a Superadmin." });
      navigate(superadminHome, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to redeem code";
      toast({ title: "Redeem failed", description: msg, variant: "destructive" });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/20 via-background to-primary/20 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-destructive to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <Shield className="w-20 h-20 mb-6" />
          <h1 className="text-5xl font-bold mb-6">Admin Portal</h1>
          <p className="text-xl text-center max-w-md">
            Restricted access — authorized personnel only
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <GlassCard className="p-8 space-y-8">
            {/* Sign-in */}
            <div>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-foreground mb-2">Superadmin Sign In</h2>
                <p className="text-muted-foreground">Use your email and password</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={signingIn}>
                  {signingIn ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Redeem access code */}
            <div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Have an access code?</h3>
                <p className="text-sm text-muted-foreground">
                  Sign in first, then redeem to elevate your permissions.
                </p>
              </div>

              <form onSubmit={handleRedeem} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Access Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="accessCode"
                      type={showCode ? "text" : "password"}
                      placeholder="Enter access code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode((s) => !s)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="secondary" disabled={redeeming}>
                  {redeeming ? "Verifying..." : "Redeem Code"}
                </Button>
              </form>
            </div>

            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                This area is restricted to authorized administrators only. All access attempts are logged and monitored.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
