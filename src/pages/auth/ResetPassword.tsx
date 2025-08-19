// src/pages/auth/ResetPassword.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [pwd, setPwd] = useState('');
  const [ok, setOk] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) nav('/', { replace: true }); // no session → send home
    })();
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) return alert(error.message);
    setOk(true);
    // optional: route by role if you fetch it here
    nav('/auth/student', { replace: true });
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Set a new password</h1>
      <input
        type="password"
        value={pwd}
        onChange={e => setPwd(e.target.value)}
        minLength={8}
        placeholder="New password"
        className="mt-4 w-full border rounded p-2"
        required
      />
      <button className="mt-4 btn btn-primary" type="submit">Update password</button>
      {ok && <p className="mt-3 text-green-600">Password updated.</p>}
    </form>
  );
}
