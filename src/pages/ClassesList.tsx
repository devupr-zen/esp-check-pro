import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, ArrowRight, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type ClassRow = {
  id: string;
  name: string | null;
  description?: string | null;
  owner_id: string;
  created_at?: string | null;
};

export default function ClassesList() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [rows, setRows] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);

  // new class dialog state
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const q = supabase
        .from("classes")
        .select("id,name,description,owner_id,created_at")
        .order("created_at", { ascending: false });

      // teachers see their own; superadmins see all
      if (profile?.role === "teacher") q.eq("owner_id", profile.id);

      const { data, error } = await q;
      if (error) {
        toast({
          title: "Load failed",
          description: error.message,
          variant: "destructive",
        });
        setRows([]);
      } else {
        setRows((data as ClassRow[]) ?? []);
      }
      setLoading(false);
    })();
  }, [profile, toast]);

  const createClass = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Enter a class name.", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { data, error } = await supabase
      .from("classes")
      .insert([{ name: name.trim(), description: desc || null, owner_id: profile?.id }])
      .select("id")
      .single();
    setCreating(false);

    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
      return;
    }
    setOpen(false);
    setName("");
    setDesc("");
    navigate(`/teacher/classes/${data!.id}/edit`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Classes</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a new class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <Textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createClass} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {creating ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No classes yet. Click <b>New Class</b> to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((c) => (
            <Card key={c.id} className="hover:shadow-sm transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{c.name || "Untitled class"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {c.description || "No description"}
                </p>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                </div>
                <div className="pt-1">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/teacher/classes/${c.id}/edit`}>
                      Open
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
