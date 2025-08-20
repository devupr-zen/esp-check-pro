export default function handler(_req: any, res: any) {
	res.status(200).json({
		ok: true,
		hasViteUrl: Boolean(
			process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
		),
		hasAnon: Boolean(process.env.VITE_SUPABASE_ANON_KEY),
		hasService: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
	});
}
