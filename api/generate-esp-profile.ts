// /api/generate-esp-profile.ts
// Server-only endpoint (Vercel). Creates an ESP profile snapshot for the authenticated user.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// -------------------- Env & Clients (server only) --------------------
const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as
  | string
  | undefined;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string | undefined;

// lazy logger (don’t crash builds if env missing; error at request-time instead)
function missingEnv(): string[] {
  const miss: string[] = [];
  if (!SUPABASE_URL) miss.push("SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) miss.push("SUPABASE_ANON_KEY");
  if (!SUPABASE_SERVICE_ROLE_KEY) miss.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!OPENAI_API_KEY) miss.push("OPENAI_API_KEY");
  return miss;
}

// Build an auth-scoped client from a bearer token (to verify user)
function supabaseForToken(jwt: string): SupabaseClient {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Admin client (bypasses RLS) – NEVER expose this to the client
const admin = () =>
  createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const openai = () => new OpenAI({ apiKey: OPENAI_API_KEY! });

// -------------------- Small helpers --------------------
function json(res: VercelResponse, status: number, body: unknown) {
  res.setHeader("Content-Type", "application/json");
  return res.status(status).send(JSON.stringify(body));
}

function allowCors(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

function toStrArray(x: unknown): string[] {
  if (Array.isArray(x)) return x.filter((s) => typeof s === "string").slice(0, 5) as string[];
  if (typeof x === "string" && x.trim()) return [x.trim()];
  return [];
}

// -------------------- Handler --------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (allowCors(req, res)) return;

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, OPTIONS");
      return json(res, 405, { error: "Method not allowed" });
    }

    const miss = missingEnv();
    if (miss.length) {
      return json(res, 500, {
        error: "Missing environment variables",
        missing: miss,
      });
    }

    // 1) Auth: require a Supabase JWT in Authorization header
    //    (If you really need the x-user-id fallback, you can keep it, but this is safer.)
    const auth = req.headers.authorization || "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
    if (!token) return json(res, 401, { error: "Missing Authorization Bearer token" });

    const sb = supabaseForToken(token);
    const { data: userRes, error: userErr } = await sb.auth.getUser();
    if (userErr || !userRes?.user) return json(res, 401, { error: "Invalid or expired token" });
    const userId = userRes.user.id;

    // 2) Validate body
    type ReqBody = {
      track?: string | null;
      answers?: Record<string, string>;
    };
    const body = (req.body || {}) as ReqBody;
    const answers = body.answers || {};
    const track = body.track ?? null;

    // 3) Basic scoring from Likert answers (1..5 → 0..100)
    const likertScore = (code: string) => {
      const v = answers[code];
      const n = v ? Number.parseInt(v, 10) : NaN;
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

    // 4) Generate concise ESP profile with OpenAI (JSON only)
    const system = "You are an ESP (English for Specific Purposes) teacher. Return strict JSON only.";
    const userPayload = {
      instruction:
        "Create an initial ESP profile from survey answers. Return JSON with keys: strengths[], weaknesses[], improvement_areas[], top_goals[] (3), level (CEFR), summary.",
      constraints: {
        strengths: 3,
        weaknesses: 3,
        improvement_areas: 3,
        top_goals: 3,
        tone: "supportive, concise",
      },
      track,
      scores,
      free_text: {
        context: answers["CONTEXT"] || "",
        painpoint: answers["PAINPOINT"] || "",
        goal: answers["GOAL_TOP"] || "",
      },
    };

    const ai = openai();
    const completion = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      return json(res, 502, { error: "LLM returned non-JSON content" });
    }

    const strengths = toStrArray(parsed.strengths);
    const weaknesses = toStrArray(parsed.weaknesses);
    const improvement_areas = toStrArray(parsed.improvement_areas ?? parsed.areas_of_improvement);
    const top_goals = toStrArray(parsed.top_goals ?? parsed.top_3_goals);
    const level = typeof parsed.level === "string" ? parsed.level : null;
    const summary = typeof parsed.summary === "string" ? parsed.summary : null;

    // 5) Insert a snapshot row (history). Use SERVICE ROLE to bypass RLS safely.
    const adminClient = admin();
    const { error: insErr } = await adminClient.from("esp_profiles").insert([
      {
        user_id: userId,
        track,
        strengths,
        weaknesses,
        improvement_areas,
        top_goals,
        scores,
        level,
        summary,
      },
    ]);

    if (insErr) {
      console.error("[generate-esp-profile] DB insert failed", insErr);
      return json(res, 500, { error: "DB insert failed", detail: insErr.message });
    }

    // Optional: maintain a "latest" materialized table
    // await adminClient.from("esp_profiles_latest").upsert({ user_id: userId, ... });

    return json(res, 200, {
      ok: true,
      profile: {
        user_id: userId,
        track,
        strengths,
        weaknesses,
        improvement_areas,
        top_goals,
        scores,
        level,
        summary,
      },
    });
  } catch (e: any) {
    console.error("[generate-esp-profile] Unexpected error", e);
    return json(res, 500, { error: e?.message ?? "Internal server error" });
  }
}
