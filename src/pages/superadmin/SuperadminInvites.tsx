// src/pages/superadmin/SuperadminInvites.tsx
import { Clock, Copy, Loader2, UserPlus, CheckCircle2, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client"; // ✅ canonical client
import { cn } from "@/lib/utils";

type Row = { email: string; code: string; expires_at: string };

const parseEmails = (raw: string) =>
  raw
    .split(/\n|,|;/g)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .filter((e, i, a) => a.indexOf(e) === i);

export default function SuperadminInvites() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState("");
  const [days, setDays] = useState<number>(90); // 90-day demo by default
  const [rows, setRows] = useState<Row[]>([]);
  const [errors, setErrors] = useState<{ email: string; error: string }[]>([]);

  const count = useMemo(() => parseEmails(emails).length, [emails]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = parseEmails(emails);
    if (list.length === 0) {
      toast({ title: "No emails", description: "Add at least one email.", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(days) || days < 1 || days > 365) {
      toast({ title: "Invalid days", description: "Days must be between 1 and 365.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setRows([]);
    setErrors([]);

    try {
      // call RPC for each email (sequential to keep rate low + clear messages)
      const results: Row[] = [];
      const errs: { email: string; error: string }[] = [];

      for (const email of list) {
        const { data, error } = await supabase.rpc("create_teacher_invite", {
          p_email: email,
          p_days: days,
        });
        if (error) {
          errs.push({ email, error: error.message });
        } else {
          const rec = (data?.[0] ?? {}) as { code?: string; expires_at?: string };
          if (rec.code && rec.expires_at) {
            results.push({ email, code: rec.code, expires_at: rec.expires_at });
          } else {
            errs.push({ email, error: "No code returned" });
          }
        }
      }

      setRows(results);
      setErrors(errs);

      if (results.length) {
        toast({
          title: "Invites created",
          description: `Generated ${results.length} code${results.length > 1 ? "s" : ""}.`,
        });
      }
      if (errs.length) {
        toast({
          title: "Some invites failed",
          description: `${errs.length} error${errs.length > 1 ? "s" : ""} encountered.`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      toast({ title: "Copied", description: "Copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Invite Teachers</h1>
      <p className="text-muted-foreground">
        Generate 90‑day demo access codes for teachers. Only superadmins can create these.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Create Invites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="emails">Teacher Emails</Label>
              <Textarea
                id="emails"
                placeholder={`teacher1@example.com\nteacher2@example.com`}
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="text-xs text-muted-foreground">
                Separate by newline, comma, or semicolon. Detected: <b>{count}</b>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days">Expires (days)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="days"
                    type="number"
                    min={1}
                    max={365}
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value || "90", 10))}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Default 90 days</p>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <Button type="submit" disabled={loading || count === 0} className="w-full sm:w-auto">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {loading ? "Creating…" : "Create Invites"}
                </Button>
              </div>
            </div>
          </form>

          {/* Results */}
          {rows.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Generated codes</div>
              <div className="rounded-lg border">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground border-b">
                  <div className="col-span-5">Email</div>
                  <div className="col-span-4">Code</div>
                  <div className="col-span-2">Expires</div>
                  <div className="col-span-1 text-right">Copy</div>
                </div>
                {rows.map((r, i) => (
                  <div key={i} className={cn("grid grid-cols-12 gap-2 px-3 py-2 items-center", i % 2 ? "bg-muted/40" : "")}>
                    <div className="col-span-5 truncate">{r.email}</div>
                    <div className="col-span-4 font-mono text-xs truncate">{r.code}</div>
                    <div className="col-span-2">{new Date(r.expires_at).toLocaleDateString()}</div>
                    <div className="col-span-1 text-right">
                      <Button size="icon" variant="ghost" onClick={() => copyText(r.code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-2">
                <AlertTriangle className="h-4 w-4" /> Errors
              </div>
              <ul className="text-sm space-y-1">
                {errors.map((e, i) => (
                  <li key={i}>
                    <span className="font-medium">{e.email}:</span> {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!rows.length && !errors.length && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Codes will appear here after creation.
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
