import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(SUPABASE_URL!, SERVICE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const path = (req.query.path as string) || '';
    if (!path) return res.status(400).json({ error: 'path is required' });

    const EXPIRES = 60 * 10; // 10 minutes
    const { data, error } = await admin.storage.from('submissions').createSignedUrl(path, EXPIRES);
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ url: data.signedUrl });
  } catch (e: any) {
    return res.status(500).json({ error: e.message ?? 'Unknown error' });
  }
}
