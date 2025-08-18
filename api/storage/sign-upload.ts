import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Missing SUPABASE env vars (NEXT_PUBLIC_SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)');
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { userId, assignmentId, filename } = req.body || {};
    if (!userId || !assignmentId || !filename) {
      return res.status(400).json({ error: 'userId, assignmentId, filename are required' });
    }

    const path = `${userId}/${assignmentId}/${Date.now()}-${filename}`;
    const { data, error } = await admin.storage.from('submissions').createSignedUploadUrl(path);
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ path, token: data.token });
  } catch (e: any) {
    return res.status(500).json({ error: e.message ?? 'Unknown error' });
  }
}
