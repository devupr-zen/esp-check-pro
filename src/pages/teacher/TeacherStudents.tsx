import { GlassCard } from "@/components/reusable/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, Send, Trash2, Calendar, AlertCircle, Plus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

/** ===== Types kept to match your UI ===== */
interface Class {
  id: string;
  name: string;
  description?: string | null;
}

interface Student {
  id: string;            // profile id
  name: string;
  email: string;
  class_name?: string;
  class_id?: string;
  status: "active" | "removed";
  joined_at: string;
  progress?: number;
}

interface StudentInvite {
  id: string;
  code: string;
  student_name: string;
  email: string;
  class_id: string;
  class_name: string;
  status: "pending" | "used" | "expired";
  created_at: string;
  expires_at: string;
}

/** Utility: robust current user id (supports profile.id or profile.user_id) */
function getProfileId(profile: any | null | undefined): string | null {
  if (!profile) return null;
  return profile.id ?? profile.user_id ?? null;
}

export default function TeacherStudents() {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [invites, setInvites] = useState<StudentInvite[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const myId = getProfileId(profile);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  async function fetchData() {
    if (!myId) return;
    try {
      setLoading(true);

      // 1) Fetch my classes (owner_id is our canonical owner column)
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id,name,description,created_at,owner_id")
        .eq("owner_id", myId)
        .order("created_at", { ascending: false });

      if (classesError) throw classesError;
      const cls: Class[] = (classesData ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? null,
      }));
      setClasses(cls);

      // 2) Fetch students in those classes (schema-agnostic, two-step fetch)
      if (cls.length > 0) {
        const classIds = cls.map((c) => c.id);
        // members: user_id, class_id, joined_at
        const { data: members, error: mErr } = await supabase
          .from("class_members")
          .select("user_id,class_id,joined_at")
          .in("class_id", classIds);

        if (mErr) {
          console.error("class_members fetch error:", mErr);
        } else {
          const userIds = Array.from(new Set((members ?? []).map((m: any) => m.user_id)));
          let profilesMap = new Map<string, { first_name: string | null; last_name: string | null; email: string }>();
          if (userIds.length > 0) {
            const { data: profs, error: pErr } = await supabase
              .from("profiles")
              .select("id,first_name,last_name,email")
              .in("id", userIds);
            if (pErr) {
              console.error("profiles fetch error:", pErr);
            } else {
              for (const p of profs ?? []) {
                profilesMap.set(p.id, {
                  first_name: p.first_name ?? null,
                  last_name: p.last_name ?? null,
                  email: p.email ?? "",
                });
              }
            }
          }

          const formattedStudents: Student[] = (members ?? []).map((m: any) => {
            const prof = profilesMap.get(m.user_id);
            const name = `${prof?.first_name ?? ""} ${prof?.last_name ?? ""}`.trim() || "—";
            const email = prof?.email ?? "";
            const className = cls.find((c) => c.id === m.class_id)?.name ?? "";
            return {
              id: m.user_id,
              name,
              email,
              class_name: className,
              class_id: m.class_id,
              status: "active", // we don't keep 'removed' in members; removal deletes the row
              joined_at: m.joined_at ?? new Date().toISOString(),
              progress: Math.floor(Math.random() * 30) + 70, // mock, kept from your UI
            };
          });

          setStudents(formattedStudents);
        }
      } else {
        setStudents([]);
      }

      // 3) Fetch pending invites created by me for my classes
      //    Uses class_invites (recommended) and optional recipient columns if present.
      if ((classesData ?? []).length > 0) {
        const classIds = (classesData ?? []).map((c: any) => c.id);
        const { data: inv, error: invErr } = await supabase
          .from("class_invites")
          .select("id,code,class_id,max_uses,used_count,expires_at,revoked,created_at,recipient_name,recipient_email")
          .in("class_id", classIds)
          .eq("created_by", myId)
          .order("created_at", { ascending: false });

        if (invErr) {
          console.error("Invites fetch error:", invErr);
        } else {
          const now = new Date();
          const formattedInvites: StudentInvite[] =
            (inv ?? [])
              // show "pending-like" invites (not revoked, not expired, still room to use)
              .filter((i: any) => !i.revoked && new Date(i.expires_at) > now && (i.used_count ?? 0) < (i.max_uses ?? 1))
              .map((i: any) => ({
                id: i.id,
                code: i.code,
                student_name: i.recipient_name ?? "", // may be empty
                email: i.recipient_email ?? "",        // may be empty
                class_id: i.class_id,
                class_name: cls.find((c) => c.id === i.class_id)?.name || "",
                status: "pending",
                created_at: i.created_at,
                expires_at: i.expires_at,
              }));
          setInvites(formattedInvites);
        }
      } else {
        setInvites([]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  /** Create & email an invite using class_invites + edge function */
  const handleInviteStudent = async () => {
    if (!studentName.trim() || !email.trim() || !selectedClassId) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);

      // Create invite via RPC (returns invite row)
      const expires = new Date();
      expires.setDate(expires.getDate() + 14);
      const { data: inviteRow, error: inviteErr } = await supabase.rpc("create_class_invite", {
        p_class_id: selectedClassId,
        p_expires_at: expires.toISOString(),
        p_max_uses: 1,
      });

      if (inviteErr) throw inviteErr;

      // Persist recipient details if those columns exist; ignore errors if they don't
      if (inviteRow?.id) {
        await supabase
          .from("class_invites")
          .update({
            recipient_name: studentName.trim(),
            recipient_email: email.trim(),
          })
          .eq("id", inviteRow.id);
      }

      // Email the invite
      const link = `${window.location.origin}/redeem/${inviteRow?.code}`;
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      const { error: emailError } = await supabase.functions.invoke("send-student-invite", {
        body: {
          studentName: studentName.trim(),
          email: email.trim(),
          inviteCode: inviteRow?.code,
          inviteLink: link,
          className: selectedClass?.name || "",
          teacherName: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Your teacher",
        },
      });
      if (emailError) throw emailError;

      toast({ title: "Success", description: `Invitation sent to ${email}` });

      // Reset form and close
      setStudentName("");
      setEmail("");
      setSelectedClassId("");
      setDialogOpen(false);

      // Refresh
      fetchData();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /** Resend invite: if recipient_email present -> email again; else copy link fallback */
  const handleResendInvite = async (inviteCode: string) => {
    try {
      setSubmitting(true);

      // Fetch the invite to get recipient info
      const { data: inv, error } = await supabase
        .from("class_invites")
        .select("code, class_id, expires_at, revoked, recipient_name, recipient_email")
        .eq("code", inviteCode)
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/redeem/${inv.code}`;
      const clsName = classes.find((c) => c.id === inv.class_id)?.name || "";

      if (inv?.recipient_email) {
        const { error: emailError } = await supabase.functions.invoke("send-student-invite", {
          body: {
            studentName: inv.recipient_name ?? "",
            email: inv.recipient_email,
            inviteCode: inv.code,
            inviteLink: link,
            className: clsName,
            teacherName: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Your teacher",
          },
        });
        if (emailError) throw emailError;

        toast({ title: "Success", description: `Invitation resent to ${inv.recipient_email}` });
      } else {
        await navigator.clipboard.writeText(link);
        toast({ title: "Link copied", description: "Invite has no stored email—share the link manually." });
      }
    } catch (error: any) {
      console.error("Error resending invite:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to resend invitation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /** Remove student from class (RPC if available, else direct delete) */
  const handleRemoveStudent = async (studentId: string, classId: string) => {
    if (!studentId || !classId) return;
    try {
      setSubmitting(true);

      // Try RPC first
      const { error: rpcErr } = await supabase.rpc("remove_student_from_class", {
        student_id_input: studentId,
        class_id_input: classId,
      });

      if (rpcErr) {
        // Fallback: direct delete from class_members
        const { error: delErr } = await supabase
          .from("class_members")
          .delete()
          .eq("class_id", classId)
          .eq("user_id", studentId);
        if (delErr) throw delErr;
      }

      toast({ title: "Success", description: "Student removed from class" });
      fetchData();
    } catch (error: any) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to remove student",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /** ===== Merge students + invites to preserve your table UX ===== */
  const allStudentsAndInvites = useMemo(
    () => [
      ...students.map((s) => ({ ...s, type: "student" as const })),
      ...invites.map((i) => ({
        id: i.id,
        name: i.student_name || "—",
        email: i.email || "",
        class_name: i.class_name,
        class_id: i.class_id,
        status: i.status as "pending",
        joined_at: i.created_at,
        type: "invite" as const,
        code: i.code,
        expires_at: i.expires_at,
      })),
    ],
    [students, invites]
  );

  const filteredData = allStudentsAndInvites.filter((item) =>
    (item.name || "—").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.class_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, type: string) => {
    if (type === "invite" && status === "pending") {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
    if (status === "active") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header + Dialog (unchanged) */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage your students and send invitations</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Student</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Student</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student's full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleInviteStudent} disabled={submitting || !selectedClassId} className="flex-1">
                    {submitting ? "Sending..." : "Send Invitation"}
                  </Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students and invites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined/Invited</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item: any) => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.class_name || "No class"}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status, item.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(item.joined_at), "MMM d, yyyy")}</span>
                    </div>
                    {item.type === "invite" && "expires_at" in item && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>Expires {format(new Date(item.expires_at), "MMM d")}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {item.type === "invite" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvite("code" in item ? item.code : "")}
                          disabled={submitting}
                          className="flex items-center space-x-1"
                        >
                          <Send className="h-3 w-3" />
                          <span>Resend</span>
                        </Button>
                      )}
                      {item.type === "student" && item.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveStudent(item.id, item.class_id || "")}
                          disabled={submitting}
                          className="flex items-center space-x-1 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "Start by inviting your first student"}
              </p>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
