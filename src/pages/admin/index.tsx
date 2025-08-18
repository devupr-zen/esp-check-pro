import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function AdminHome() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      // Optional: ensure we have a session first
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr) {
        console.error(userErr)
        setErrorMsg("Unable to verify session.")
        setAllowed(false)
        return
      }
      if (!user) {
        setErrorMsg("You must be signed in to access admin.")
        setAllowed(false)
        return
      }

      // Gate with RPC (DB is the source of truth)
      const { data, error } = await supabase.rpc("is_superadmin")
      if (error) {
        console.error(error)
        setErrorMsg("Access check failed. Contact support.")
        setAllowed(false)
        return
      }
      setAllowed(Boolean(data))
    })()
  }, [])

  if (allowed === null) {
    return <div className="p-6">Checking access…</div>
  }

  if (!allowed) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="text-red-600">Access denied.</div>
        {errorMsg && <div className="text-sm text-muted-foreground">{errorMsg}</div>}
        <a href="/"><Button variant="outline">Go Home</Button></a>
      </div>
    )
  }

  // ✅ Allowed: show the hub. Keep it simple and extensible.
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        {/* If you prefer auto-redirect to Users, uncomment:
        useEffect(() => { if (allowed) window.location.replace("/admin/users") }, [allowed])
        */}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Users & Roles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View all profiles and change roles securely via <code>admin_set_role</code>.
          </p>
          <div className="mt-3">
            <a href="/admin/users"><Button>Open Users</Button></a>
          </div>
        </div>

        {/* Placeholder for future tools — safe to keep now */}
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">System Checks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add quick diagnostics here (RLS, RPCs, invites) when needed.
          </p>
          <div className="mt-3">
            <Button variant="outline" disabled>Coming soon</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
