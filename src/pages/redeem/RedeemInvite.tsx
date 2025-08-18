import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RedeemInvite() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      // Redirect to student auth with return URL
      navigate(`/auth/student?returnTo=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [profile, navigate]);

  const redeemInvite = async () => {
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("redeem_class_invite", {
        p_code: code,
      });

      if (error) throw error;

      setRedeemed(true);
      toast({ title: "Success!", description: "You've successfully joined the class!" });
      
      // Redirect to student dashboard after a short delay
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }

    setLoading(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-lg">Redirecting to login...</div>
          </CardContent>
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
                Class Joined!
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-6 h-6 text-red-600" />
                Join Failed
              </>
            ) : (
              "Join Class"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {redeemed ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You've successfully joined the class! Redirecting to your dashboard...
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate("/student/dashboard")} variant="outline">
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You're about to join a class using invite code: <code className="bg-muted px-2 py-1 rounded">{code}</code>
              </p>
              <Button onClick={redeemInvite} disabled={loading} className="w-full">
                {loading ? "Joining..." : "Join Class"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}