// src/pages/auth/ResetPassword.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [pwd, setPwd] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event (when user comes from reset email link)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery flow triggered", session);
        // You could show a specific UI if needed
      }
    });

    // Also check if the user is logged in (temporary session)
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // No session → bounce home
        nav("/", { replace: true });
      }
    })();

    return () => subscription.unsubscribe();
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setOk(true);

    // Redirect based on role (optional: query profiles table if needed)
    // Here we assume student reset most of the time
    nav("/auth/student", { replace: true });
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Set a new password</h1>

      <input
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        minLength={8}
        placeholder="New password"
        className="mt-4 w-full border rounded p-2"
        required
      />

      <button
        className="mt-4 btn btn-primary"
        type="submit"
        disabled={loading}
      >
        {loading ? "Updating..." : "Update password"}
      </button>

      {ok && <p className="mt-3 text-green-600">Password updated successfully.</p>}
    </form>
  );
}
