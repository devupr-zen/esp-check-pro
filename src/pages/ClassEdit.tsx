import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import InviteStudentsModal from "@/components/teacher/InviteStudentsModal";
import {
  ArrowLeft, Calendar, Loader2, Mail, RefreshCw, Save, Users, Copy
} from "lucide-react";

type ClassRow = {
  id: string;
  name: string | null;
  description?: string | null;
  owner_id: string;
  created_at?: string | null;
};

type MemberRow = { user_id: string };
type Profile = {
  id: string; email?: string | null;
  first_name?: string | null; last_name?: string | null; role?: string | null;
};

type InviteRow = { email: string | null; code: string; expires_at: string };

export default function ClassEdit() {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [row, setRow] = useState<ClassRow | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const [members, setMembers] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [invitesError, setInvitesError] = useState<string | null>(null);

  const canEdit = useMemo(
    () => !!row && profile?.role === "teacher" && row.owner_id === profile?.id,
    [row, profile]
  );

  useEffect(() => {
    if (!classId) return;
    (async () => {
      setLoading(true);

      // 1) Class row
      const { data: cls, error: clsErr } = await supabase
        .from("classes")
        .select("id,name,description,owner_id,created_at")
        .eq("id", classId)
        .maybeSingle();

      if (clsErr || !cls) {
        toast({ title: "Not found", description: "Class not found.", variant: "destructive" });
        setLoading(false);
        return;
      }

      setRow(cls as ClassRow);
      setName((cls as ClassRow).name ?? "");
      setDesc((cls as ClassRow).description ?? "");

      // 2) Members → profiles
      const { data: mems } = await supabase
        .from("class_members")
        .select("user_id")
        .eq("class_id", classId);

      const ids = (mems as MemberRow[] | null)?.map(m => m.user_id) ?? [];
      let profiles: Profile[] = [];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,email,first_name,last_name,role")
          .in("id", ids);
        profiles = (profs as Profile[] | null) ?? [];
      }
      setMembers(profiles);

      // 3) Pending invites (gracefully handle RLS errors)
      setInvitesError(null);
      const { data: inv, error: invErr } = await supabase
        .from("student_invites")
        .select("email,code,expires_at,redeemed,class_id,created_by")
        .eq("class_id", classId)
        .eq("redeemed", false)
        .order("expires_at", { ascending: true });

      if (invErr) {
        setInvites([]);
        setInvitesError("Unable to load pending invites (RLS). Newly created codes will still show in the modal.");
      } else {
        setInvites(
          (inv as any[])?.map(r => ({
            email: r.email,
            code: r.code,
            expires_at: r.expires_at,
          })) ?? []
        );
      }

      setLoading(false);
    })();
  }, [classId, toast]);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase
      .from("classes")
      .update({ name, description: desc })
      .eq("id", row.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved", description: "Class details updated." });
  };

  const refresh = async () => {
    // trivial trigger to reload effect
    setLoading(true);
    setTimeout(() => setLoading(false), 1);
  };

  if (!classId) {
    return (
      <div className="p-6">
        <Button variant="ghost" asChild>
          <Link to="/teacher/classes"><ArrowLeft className="h-4 w-4 mr-1" />Back to classes</Link>
        </Button>
        <div className="mt-6 text-muted-foreground">Missing class id.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading class…
        </div>
      </div>
    );
  }

  if (!row) return null;

  const initials = (row.name ?? "C").slice(0, 2).toUpperCase();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/teacher/classes"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <div>
              <div className="text-xl font-semibold">{row.name || "Untitled class"}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> {members.length} member{members.length !== 1 ? "s" : ""}
                {row.created_at && (
                  <>
                    <Calendar className="h-3.5 w-3.5 ml-2" />
                    Created {new Date(row.created_at).toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          <InviteStudentsModal classId={row.id} />
        </div>
      </div>

      {/* Details card */}
      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Owner</label>
              <Input value={row.owner_id} disabled readOnly />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Description</label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} disabled={!canEdit} />
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={!canEdit || saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.length === 0 && (
            <div className="text-sm text-muted-foreground">No members yet. Invite students to join.</div>
          )}
          {members.map((m) => {
            const name = [m.first_name, m.last_name].filter(Boolean).join(" ") || m.email || m.id;
            const initials = (name || "?").slice(0, 2).toUpperCase();
            return (
              <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                  <div>
                    <div className="text-sm">{name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {m.email || "—"}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{m.role || "student"}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pending invites */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invitesError && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              {invitesError}
            </div>
          )}
          {invites.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending invites.</div>
          ) : (
            <div className="rounded border">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground border-b">
                <div className="col-span-5">Email</div>
                <div className="col-span-5">Code</div>
                <div className="col-span-2">Expires</div>
              </div>
              {invites.map((iv, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                  <div className="col-span-5 truncate">{iv.email || "—"}</div>
                  <div className="col-span-5 font-mono text-xs truncate">{iv.code}</div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span>{new Date(iv.expires_at).toLocaleDateString()}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(iv.code)}
                      title="Copy code"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
