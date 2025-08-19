// src/pages/superadmin/SuperadminInvites.tsx
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/reusable/GlassCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Key, UserPlus, Clock, Copy } from "lucide-react";

function genCode(len = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz";
  let out = "";
  crypto.getRandomValues(new Uint8Array(len)).forEach((n) => (out += chars[n % chars.length]));
  return out;
}

export default function SuperadminInvites() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState(genCode());
  const [days, setDays] = useState<number>(14);
  const { toast } = useToast();

  const expiresAtIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (Number.isFinite(days) ? days : 14));
    return d.toISOString();
  }, [days]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast({ title: "Copied", description: "Invite code copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  const regenerate = () => setInviteCode(genCode());

  const generateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("teacher_credentials").insert([
        {
          email,
          invite_code: inviteCode,   // ← renamed column
          is_used: false,
          expires_at: expiresAtIso,
        },
      ]);
      if (error) throw error;

      toast({
        title: "Invite created",
        description: `Invite for ${email} generated. Share the code with them.`,
      });

      setEmail("");
      regenerate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Teacher Invites</h1>

      <GlassCard className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" /> Generate New Invite
        </h2>
        <form onSubmit={generateInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteEmail">Teacher Email</Label>
            <Input
              id="inviteEmail"
              type="email"
              placeholder="teacher@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="pl-10 pr-24"
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="absolute right-1 top-1 h-8 px-2"
                  onClick={regenerate}
                >
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this one-time code with the teacher. They’ll enter it on the Teacher portal.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresDays">Expires (days)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expiresDays"
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value || "14", 10))}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">Default 14 days</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={copy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Invite"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </main>
  );
}
