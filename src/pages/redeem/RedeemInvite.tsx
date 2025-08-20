import { AlertCircle, CheckCircle } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Mode = "teacher" | "student" | "class";

export default function RedeemInvite() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode: Mode = useMemo(() => {
    if (!code) return "class";
    if (code.toUpperCase().startsWith("TCH-")) return "teacher";
    if (code.toUpperCase().startsWith("STD-")) return "student";
    return "class"; // default to class invite
  }, [code]);

  // Redirect unauthenticated users to the right auth screen with returnTo
  useEffect(() => {
    if (!profile) {
      const returnTo = encodeURIComponent(window.location.pathname);
      if (mode === "teacher") {
        navigate(`/auth/teacher?returnTo=${returnTo}`);
      } else {
        navigate(`/auth/student?returnTo=${returnTo}`);
      }
    }
  }, [profile, navigate, mode]);

  const titleByMode: Record<Mode, string> = {
    teacher: "Redeem Teacher Invite",
    student: "Redeem Student Invite",
    class: "Join Class",
  };

  const onRedeem = async () => {
    if (!code) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === "teacher") {
        const { error } = await supabase.rpc("redeem_teacher_invite", { p_code: code });
        if (error) throw error;
        setRedeemed(true);
        toast({ title: "Welcome!", description: "Your teacher access is now active." });
        setTimeout(() => navigate("/teacher/dashboard", { replace: true }), 1500);
        return;
      }

      if (mode === "student") {
        const { error } = await supabase.rpc("redeem_student_invite", { p_code: code });
        if (error) throw error;
        setRedeemed(true);
        toast({ title: "Success!", description: "Your student invite has been redeemed." });
        setTimeout(() => navigate("/student/dashboard", { replace: true }), 1500);
        return;
      }

      // default: class invite (existing RPC you already had)
      const { error } = await supabase.rpc("redeem_class_invite", { p_code: code });
      if (error) throw error;
      setRedeemed(true);
      toast({ title: "Joined!", description: "You have joined the class." });
      setTimeout(() => navigate("/student/dashboard", { replace: true }), 1500);
    } catch (e: any) {
      setError(e?.message ?? "Invite redemption failed");
      toast({
        title: "Error",
        description: e?.message ?? "Invite redemption failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // While redirecting unauthenticated users
  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">Redirecting to login…</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {redeemed ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" />
                Success
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-6 h-6 text-red-600" />
                {titleByMode[mode]}
              </>
            ) : (
              titleByMode[mode]
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {redeemed ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Invite code <code className="bg-muted px-1 rounded">{code}</code> was redeemed.
              </p>
              <Button
                onClick={() =>
                  navigate(
                    mode === "teacher" ? "/teacher/dashboard" : "/student/dashboard",
                    { replace: true }
                  )
                }
                className="w-full"
              >
                Go to {mode === "teacher" ? "Teacher" : "Student"} Dashboard
              </Button>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
                <Link to="/">
                  <Button variant="ghost">Home</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {mode === "teacher" && "You’re about to activate a teacher account with this invite."}
                {mode === "student" && "You’re about to redeem a student invite code."}
                {mode === "class" && "You’re about to join a class using this invite code."}
                <br />
                Code: <code className="bg-muted px-1 rounded">{code}</code>
              </p>
              <Button onClick={onRedeem} disabled={loading} className="w-full">
                {loading ? "Processing…" : "Redeem"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
