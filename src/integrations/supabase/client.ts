import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  "https://cbonwagnnrrpvpemaiek.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib253YWdubnJycHZwZW1haWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjkyNDcsImV4cCI6MjA3MTA0NTI0N30.DdSNBNPEhzkUJWZojSLX_lnlIjeZ8qPzjNiq6oEaE08",
  {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    global: { fetch: (url: RequestInfo | URL, init?: RequestInit) => fetch(url, init) },
  }
)
