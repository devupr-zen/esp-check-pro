export type AppRole = "student" | "teacher" | "superadmin"

export type Profile = {
  id: string
  email: string
  role: AppRole
  first_name: string | null
  last_name: string | null
  created_at?: string
  updated_at?: string
}
