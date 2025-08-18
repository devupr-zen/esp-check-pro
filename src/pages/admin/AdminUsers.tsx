import React, { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/AuthProvider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type Role = "student" | "teacher" | "superadmin"
type Row = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: Role
  created_at: string
}

export default function AdminUsers() {
  const { profile } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all")
  const [saving, setSaving] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    // Simple fetch; you can paginate later
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false })
    if (q.trim()) {
      // search by email or name
      query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
    }
    if (roleFilter !== "all") {
      query = query.eq("role", roleFilter)
    }
    const { data, error } = await query.limit(200)
    if (error) alert(error.message)
    setRows((data || []) as any)
    setLoading(false)
  }

  useEffect(() => { load() }, []) // initial load
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [q, roleFilter]) // debounced

  const filtered = useMemo(() => rows, [rows]) // already filtered in query

  function fullName(r: Row) {
    const n = [r.first_name, r.last_name].filter(Boolean).join(" ")
    return n || "—"
  }

  async function changeRole(userId: string, newRole: Role) {
    if (userId === profile?.id && newRole !== "superadmin") {
      if (!confirm("You are about to remove your superadmin role from yourself. Continue?")) return
    }
    setSaving(userId)
    // optimistic update
    setRows(rs => rs.map(r => r.id === userId ? { ...r, role: newRole } : r))
    const { error } = await supabase.rpc("admin_set_role", { target_user: userId, new_role: newRole })
    setSaving(null)
    if (error) {
      alert(error.message)
      // revert on error
      await load()
    }
  }

  function roleBadge(role: Role) {
    const variant = role === "superadmin" ? "default" : role === "teacher" ? "secondary" : "outline"
    return <Badge variant={variant} className="capitalize">{role}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin — Users & Roles</h1>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder="Search email or name…" value={q} onChange={e=>setQ(e.target.value)} className="max-w-sm" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Role</span>
          <Select value={roleFilter} onValueChange={(v)=>setRoleFilter(v as any)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={4}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="p-3 text-muted-foreground" colSpan={4}>No users found.</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{fullName(r)}</div>
                  <div className="text-xs text-muted-foreground font-mono">{r.id}</div>
                </td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{roleBadge(r.role)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant={r.role === "student" ? "default" : "outline"} disabled={saving === r.id || r.role === "student"} onClick={() => changeRole(r.id, "student")}>Make student</Button>
                    <Button size="sm" variant={r.role === "teacher" ? "default" : "outline"} disabled={saving === r.id || r.role === "teacher"} onClick={() => changeRole(r.id, "teacher")}>Make teacher</Button>
                    <Button size="sm" variant={r.role === "superadmin" ? "default" : "outline"} disabled={saving === r.id || r.role === "superadmin"} onClick={() => changeRole(r.id, "superadmin")}>Make superadmin</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
