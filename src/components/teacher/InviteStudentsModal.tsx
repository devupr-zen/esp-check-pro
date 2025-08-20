import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const parseEmails = (raw: string) =>
  raw.split(/\n|,|;/g).map(e => e.trim().toLowerCase()).filter(Boolean).filter((e,i,a)=>a.indexOf(e)===i);

export default function InviteStudentsModal({ classId }: { classId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<{email:string; code:string; expires_at:string}[]>([]);
  const [loading, setLoading] = useState(false);

  const createInvites = async () => {
    const list = parseEmails(emails);
    if (!classId || list.length === 0) {
      toast({ title: "Missing data", description: "Add at least one email.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setRows([]);
    const { data, error } = await supabase.rpc("create_student_invites_for_class", {
      p_class_id: classId,
      p_emails: list,
      p_days: days,
    });
    setLoading(false);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setRows((data as any[])?.map(d => ({ email: d.email, code: d.code, expires_at: d.expires_at })) || []);
  };

  const copy = async (txt: string) => {
    try { await navigator.clipboard.writeText(txt); toast({ title: "Copied" }); }
    catch { toast({ title: "Copy failed", variant: "destructive" }); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Invite Students</Button></DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Students</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Emails</Label>
            <Textarea placeholder={`s1@example.com\ns2@example.com`} value={emails} onChange={e=>setEmails(e.target.value)} />
            <p className="text-xs text-muted-foreground">Separate by newline, comma, or semicolon.</p>
          </div>
          <div className="space-y-2">
            <Label>Expires (days)</Label>
            <Input type="number" min={1} max={365} value={days} onChange={e=>setDays(parseInt(e.target.value||"30",10))}/>
          </div>
          {rows.length>0 && (
            <div className="border rounded">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground border-b">
                <div className="col-span-5">Email</div>
                <div className="col-span-5">Code</div>
                <div className="col-span-2 text-right">Copy</div>
              </div>
              {rows.map((r,i)=>(
                <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                  <div className="col-span-5 truncate">{r.email}</div>
                  <div className="col-span-5 font-mono text-xs truncate">{r.code}</div>
                  <div className="col-span-2 text-right">
                    <Button size="icon" variant="ghost" onClick={()=>copy(r.code)}><Copy className="h-4 w-4"/></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Results */}
        {rows.length>0 && (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Generated codes</div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={()=>{
                const txt = rows.map(r => `${r.email},${r.code},${new Date(r.expires_at).toISOString()}`).join("\n");
                navigator.clipboard.writeText(txt);
                }}>
                Copy all
                </Button>
                <Button variant="outline" size="sm" onClick={()=>{
                const header = "email,code,expires_at\n";
                const body = rows.map(r => `${r.email},${r.code},${new Date(r.expires_at).toISOString()}`).join("\n");
                const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "student_invites.csv";
                a.click();
                URL.revokeObjectURL(url);
                }}>
                Export CSV
                </Button>
            </div>
            </div>

            <div className="border rounded">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground border-b">
                <div className="col-span-5">Email</div>
                <div className="col-span-5">Code</div>
                <div className="col-span-2">Expires</div>
            </div>
            {rows.map((r,i)=>(
                <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                <div className="col-span-5 truncate">{r.email}</div>
                <div className="col-span-5 font-mono text-xs truncate">{r.code}</div>
                <div className="col-span-2">{new Date(r.expires_at).toLocaleDateString()}</div>
                </div>
            ))}
            </div>
        </div>
        )}

        <DialogFooter>
          <Button onClick={createInvites} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Creating…" : "Create Invites"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
