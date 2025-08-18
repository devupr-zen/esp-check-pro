import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormState = { name: string; level: string }

export default function ClassEdit() {
  const { id } = useParams() // 'new' or uuid
  const isNew = id === "new"
  const nav = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState<FormState>({ name: "", level: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchRow() {
      if (isNew) return
      const { data, error } = await supabase.from("classes").select("id,name,level").eq("id", id).single()
      if (error) return alert(error.message)
      setForm({ name: data!.name, level: data!.level || "" })
    }
    fetchRow()
  }, [id, isNew])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return alert("Class name is required.")
    setLoading(true)
    if (isNew) {
      const { error } = await supabase.from("classes").insert({
        name: form.name.trim(),
        level: form.level.trim() || null,
        teacher_id: user.id,
      } as any)
      setLoading(false)
      if (error) return alert(error.message)
    } else {
      const { error } = await supabase.from("classes").update({
        name: form.name.trim(),
        level: form.level.trim() || null,
      }).eq("id", id)
      setLoading(false)
      if (error) return alert(error.message)
    }
    nav("/teacher/classes")
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">{isNew ? "New class" : "Edit class"}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>Class name</Label>
          <Input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required placeholder="e.g., GE A2 Morning" />
        </div>
        <div>
          <Label>Level (optional)</Label>
          <Input value={form.level} onChange={e=>setForm({...form, level:e.target.value})} placeholder="A2 / B1 / B2 / C1 / C2" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
          <Button type="button" variant="outline" onClick={() => nav(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
