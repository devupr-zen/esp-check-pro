// Edge Function: score-writing
// Minimal deterministic scoring stub (replace with OpenAI later)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,       // set via `supabase secrets set`
  Deno.env.get("SERVICE_ROLE_KEY")!   // set via `supabase secrets set`
);

type Subscores = {
  writing: {
    "Task achievement": number;
    "Clarity & concision": number;
    "Register/Tone": number;
    "Coherence": number;
    "Language control": number;
  };
};

Deno.serve(async (req) => {
  try {
    const { attemptId } = await req.json();

    // Fetch responses for that attempt
    const { data: resps, error } = await supabase
      .from("responses")
      .select("response")
      .eq("attempt_id", attemptId);

    if (error) throw error;

    // Placeholder scoring (deterministic): base + #responses
    const base = Math.min(100, 40 + (resps?.length ?? 0) * 10);
    const subscores: Subscores = {
      writing: {
        "Task achievement": 4,
        "Clarity & concision": 4,
        "Register/Tone": 3,
        "Coherence": 3,
        "Language control": 3
      }
    };

    const { error: updErr } = await supabase
      .from("assessment_attempts")
      .update({ score: base, subscores, status: "graded" })
      .eq("id", attemptId);
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ ok: true, score: base, subscores }), {
      headers: { "content-type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
});
