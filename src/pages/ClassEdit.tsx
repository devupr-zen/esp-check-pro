// src/pages/teacher/ClassEdit.tsx
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
  ArrowLeft,
  Calendar,
  Loader2,
  Mail,
  RefreshCw,
  Save,
  Users,
  Copy,
  Trash2,
  UserMinus,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ClassRow = {
  id: string;
  name: string | null;
  description?: string | null;
  owner_id: string;
  created_at?: string | null;
};

type MemberRow = { user_id: string };
type Profile = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
};

type InviteRow = { email: string | null; code: string; expires_at: string };

export default function ClassEdit() {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const hasChanges = useMemo(() => {
    if (!row) return false;
    return (name ?? "") !== (row.name ?? "") || (desc ?? "") !== (row.description ?? "");
  }, [row, name, desc]);

  // load class + members + pending invites
  const loadAll = async (id: string) => {
    // class
    const { data: cls } = await supabase
      .from("classes")
      .select("id,name,description,owner_id,created_at")
      .eq("id", id)
      .maybeSingle();
    if (!cls) return false;
    const classRow = cls as ClassRow;
    setRow(classRow);
    setName(classRow.name ?? "");
    setDesc(classRow.description ?? "");

    // members
    const { data: mems } = await supabase
      .from("class_members")
      .select("user_id")
      .eq("class_id", id);
    const ids = (mems as MemberRow[] | null)?.map((m) => m.user_id) ?? [];
    let profiles: Profile[] = [];
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name,role")
        .in("id", ids);
      profiles = (profs as Profile[] | null) ?? [];
    }
    setMembers(profiles);

    // invites
    setInvitesError(null);
    const { data: inv, error: invErr } = await supabase
      .from("student_invites")
      .select("email,code,expires_at,redeemed,class_id,created_by")
      .eq("class_id", id)
      .eq("redeemed", false)
      .order("expires_at", { ascending: true });

    if (invErr) {
      setInvites([]);
      setInvitesError(
        "Unable to load pending invites (RLS). Newly created codes will still show in the modal."
      );
    } else {
      setInvites(
        (inv as any[])?.map((r) => ({
          email: r.email,
          code: r.code,
          expires_at: r.expires_at,
        })) ?? []
      );
    }
    return true;
  };

  useEffect(() => {
    if (!classId) return;
    (async () => {
      setLoading(true);
      const ok = await loadAll(classId);
      if (!ok) {
        toast({ title: "Not found", description: "Class not found.", variant: "destructive" });
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
    setRow((prev) => (prev ? { ...prev, name, description: desc } : prev));
    toast({ title: "Saved", description: "Class details updated." });
  };

  const refresh = async () => {
    if (!classId) return;
    setLoading(true);
    await loadAll(classId);
    setLoading(false);
  };

  const removeClass = async () => {
    if (!row) return;
    setDeleting(true);
    const { error } = await supabase.from("classes").delete().eq("id", row.id);
    setDeleting(false);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Class deleted", description: "Redirecting to classes…" });
    navigate("/teacher/classes", { replace: true });
  };

  const removeMember = async (userId: string) => {
    if (!row) return;
    const { error } = await supabase
      .from("class_members")
      .delete()
      .eq("class_id", row.id)
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Remove failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Removed", description: "Student removed from class." });
    refresh();
  };

  if (!classId) {
    return (
      <div className="p-6">
        <Button variant="ghost" asChild>
          <Link to="/teacher/classes">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to classes
          </Link>
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
            <Link to="/teacher/classes">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold">
                {row.name || "Untitled class"}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> {members.length} member
                {members.length !== 1 ? "s" : ""}
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
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <InviteStudentsModal classId={row.id} />
          {canEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Class
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this class?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the class. Members and invites
                    may be removed based on database constraints. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={removeClass}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting…
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Owner</label>
              <Input value={row.owner_id} disabled readOnly />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Description</label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              disabled={!canEdit}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={!canEdit || saving || !hasChanges}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Saving…" : hasChanges ? "Save changes" : "Saved"}
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
            <div className="text-sm text-muted-foreground">
              No members yet. Invite students to join.
            </div>
          )}
          {members.map((m) => {
            const full = [m.first_name, m.last_name].filter(Boolean).join(" ");
            const display = full || m.email || m.id;
            const ini = (display || "?").slice(0, 2).toUpperCase();
            const removable = canEdit && m.id !== row.owner_id; // don’t remove the owner

            return (
              <div
                key={m.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{ini}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm">{display}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {m.email || "—"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{m.role || "student"}</Badge>
                  {removable && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove from class?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This student will be removed from this class. You can
                            invite them again later if needed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeMember(m.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
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
