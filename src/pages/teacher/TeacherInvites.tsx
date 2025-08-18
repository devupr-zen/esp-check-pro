import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ClassInvite = {
  id: string;
  code: string;
  class_id: string;
  max_uses: number;
  used_count: number;
  expires_at: string;
  revoked: boolean;
  created_at: string;
  classes?: {
    name: string;
  };
};

export default function TeacherInvites() {
  const [invites, setInvites] = useState<ClassInvite[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadClasses();
    loadInvites();
  }, []);

  const loadClasses = async () => {
    const { data, error } = await supabase
      .from("classes")
      .select("id, name")
      .eq("owner_id", (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setClasses(data || []);
      if (data && data.length > 0) {
        setSelectedClass(data[0].id);
      }
    }
  };

  const loadInvites = async () => {
    const { data, error } = await supabase
      .from("class_invites")
      .select(`
        *,
        classes!inner(name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setInvites(data || []);
    }
  };

  const createInvite = async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("create_class_invite", {
        p_class_id: selectedClass,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Invite created successfully!" });
      loadInvites();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const revokeInvite = async (code: string) => {
    try {
      const { error } = await supabase.rpc("revoke_class_invite", {
        p_code: code,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Invite revoked successfully!" });
      loadInvites();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/redeem/${code}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Copied!", description: "Invite link copied to clipboard" });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Class Invites</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Invite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={createInvite} disabled={loading || !selectedClass}>
            Create Invite
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {invites.map((invite) => (
          <Card key={invite.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{invite.classes?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Code: {invite.code} • Used: {invite.used_count}/{invite.max_uses}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Expires: {new Date(invite.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {invite.revoked ? (
                    <Badge variant="destructive">Revoked</Badge>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInviteLink(invite.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => revokeInvite(invite.code)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}