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
  const [allowed, setAllowed] = useState<boolean | null>(null)

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all")
  const [saving, setSaving] = useState<string | null>(null)

  // ---- Access guard (must be superadmin) ----
  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.rpc("is_superadmin")
      if (error) {
        console.error(error)
        setAllowed(false)
      } else {
        setAllowed(Boolean(data))
      }
    })()
  }, [])

  // ---- Data load ----
  async function load() {
    setLoading(true)
    let query = supabase
      .from("profiles")
      .select("id,email,first_name,last_name,role,created_at")
      .order("created_at", { ascending: false })

    if (q.trim()) {
      // search by email or name (case-insensitive)
      const s = q.trim()
      query = query.or(
        `email.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%`
      )
    }
    if (roleFilter !== "all") {
      query = query.eq("role", roleFilter)
    }

    const { data, error } = await query.limit(200)
    if (error) {
      console.error(error)
      alert(error.message)
      setRows([])
    } else {
      setRows((data || []) as Row[])
    }
    setLoading(false)
  }

  useEffect(() => { if (allowed) load() }, [allowed]) // initial load after access check
  useEffect(() => { if (!allowed) return; const t = setTimeout(load, 250); return () => clearTimeout(t) }, [q, roleFilter, allowed]) // debounced

  const filtered = useMemo(() => rows, [rows]) // already filtered at query level

  function fullName(r: Row) {
    const n = [r.first_name, r.last_name].filter(Boolean).join(" ")
    return n || "—"
  }

  async function isLastSuperadmin(): Promise<boolean> {
    // Safety: do not allow removing the last superadmin
    const { count, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "superadmin")
    if (error) {
      console.warn("Could not count superadmins:", error.message)
      return false // fail-open to avoid blocking in case of RLS; the RPC will still enforce
    }
    return (count || 0) <= 1
  }

  async function changeRole(userId: string, newRole: Role) {
    // Self-protection prompt
    if (userId === profile?.id && newRole !== "superadmin") {
      // optional extra guard: prevent demoting the last superadmin
      const last = await isLastSuperadmin()
      if (last) {
        alert("You are the last superadmin. Add another superadmin before demoting yourself.")
        return
      }
      if (!confirm("You are about to remove your superadmin role from yourself. Continue?")) return
    }

    setSaving(userId)
    const prev = rows
    // optimistic update
    setRows(rs => rs.map(r => r.id === userId ? { ...r, role: newRole } : r))
    const { error } = await supabase.rpc("admin_set_role", { target_user: userId, new_role: newRole })
    setSaving(null)
    if (error) {
      alert(error.message)
      console.error(error)
      setRows(prev) // revert
    }
  }

  function roleBadge(role: Role) {
    const variant = role === "superadmin" ? "default" : role === "teacher" ? "secondary" : "outline"
    return <Badge variant={variant} className="capitalize">{role}</Badge>
  }

  if (allowed === null) {
    return <div className="p-6">Checking access…</div>
  }
  if (!allowed) {
    return <div className="p-6 text-red-600">Access denied.</div>
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin — Users & Roles</h1>
        <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
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
