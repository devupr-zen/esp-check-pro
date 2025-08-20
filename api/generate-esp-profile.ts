import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

// --------- Setup (server-only secrets) ----------
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env
	.SUPABASE_SERVICE_ROLE_KEY as string;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
	// Don't throw at import time—return a 500 later with a helpful message
	// This keeps Vercel build from failing if envs aren't set in preview env yet.
	// eslint-disable-next-line no-console
	console.warn(
		"[generate-esp-profile] Missing required env vars. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY.",
	);
}

const supabase = createClient(
	SUPABASE_URL || "",
	SUPABASE_SERVICE_ROLE_KEY || "",
);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY || "" });

// --------- Handler ----------
export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "POST")
		return res.status(405).json({ error: "Method not allowed" });

	try {
		// 1) Auth context from client
		const userId = (req.headers["x-user-id"] as string | undefined)?.trim();
		if (!userId)
			return res.status(400).json({ error: "Missing x-user-id header" });

		// 2) Input
		const { track, answers } = (req.body || {}) as {
			track?: string | null;
			answers?: Record<string, string>;
		};
		if (!answers) return res.status(400).json({ error: "Missing answers" });

		// 3) Lightweight scores from Likert answers (1..5 -> 0..100)
		const likertScore = (code: string) => {
			const v = answers?.[code];
			const n = v ? parseInt(v, 10) : NaN;
			if (!Number.isFinite(n)) return 50;
			return Math.max(0, Math.min(100, (n - 1) * 25));
		};
		const scores = {
			reading: likertScore("READING"),
			listening: likertScore("LISTENING"),
			grammar: likertScore("GRAMMAR"),
			vocabulary: likertScore("VOCAB"),
			meeting: likertScore("CONFIDENCE_MEETING"),
			presentation: likertScore("CONFIDENCE_PRESENT"),
			conversation: likertScore("CONFIDENCE_SOCIAL"),
		};

		// 4) OpenAI: generate concise ESP profile as JSON
		const system =
			"You are an ESP (English for Specific Purposes) teacher. Return strict JSON only.";
		const user = JSON.stringify({
			instruction:
				"Create an initial ESP profile from survey answers. Return JSON with keys: strengths[], weaknesses[], improvement_areas[], top_goals[] (3), level (CEFR), summary.",
			constraints: {
				strengths: 3,
				weaknesses: 3,
				improvement_areas: 3,
				top_goals: 3,
				tone: "supportive, concise",
			},
			track: track ?? null,
			scores,
			free_text: {
				context: answers["CONTEXT"] || "",
				painpoint: answers["PAINPOINT"] || "",
				goal: answers["GOAL_TOP"] || "",
			},
		});

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			response_format: { type: "json_object" },
			temperature: 0.2,
			messages: [
				{ role: "system", content: system },
				{ role: "user", content: user },
			],
		});

		const content = completion.choices?.[0]?.message?.content || "{}";
		let parsed: any = {};
		try {
			parsed = JSON.parse(content);
		} catch {
			return res.status(502).json({ error: "LLM returned non-JSON content" });
		}

		// Normalize keys (your table column is improvement_areas)
		const strengths = toStrArray(parsed.strengths);
		const weaknesses = toStrArray(parsed.weaknesses);
		const improvement_areas = toStrArray(
			parsed.improvement_areas ?? parsed.areas_of_improvement,
		);
		const top_goals = toStrArray(parsed.top_goals ?? parsed.top_3_goals);
		const level = typeof parsed.level === "string" ? parsed.level : null;
		const summary = typeof parsed.summary === "string" ? parsed.summary : null;

		// 5) Insert a new snapshot row (keep history). No upsert by user—append.
		const { error: insertErr } = await supabase.from("esp_profiles").insert([
			{
				user_id: userId,
				track: track ?? null,
				strengths,
				weaknesses,
				improvement_areas,
				top_goals,
				scores,
				level,
				summary,
			},
		]);

		if (insertErr) {
			// eslint-disable-next-line no-console
			console.error("[generate-esp-profile] DB insert failed", insertErr);
			return res
				.status(500)
				.json({ error: "DB insert failed", detail: insertErr.message });
		}

		return res.status(200).json({
			ok: true,
			profile: {
				strengths,
				weaknesses,
				improvement_areas,
				top_goals,
				scores,
				level,
				summary,
				track: track ?? null,
			},
		});
	} catch (err: any) {
		// eslint-disable-next-line no-console
		console.error("[generate-esp-profile] Unexpected error", err);
		return res
			.status(500)
			.json({ error: err?.message || "Internal server error" });
	}
}

function toStrArray(x: any): string[] {
	if (Array.isArray(x))
		return x.filter((s) => typeof s === "string").slice(0, 5);
	if (typeof x === "string" && x.trim()) return [x.trim()];
	return [];
}
