// Edge Function: gen-items
// Seeds a basic English item for the given template
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("PROJECT_URL")!,       // set via `supabase secrets set`
  Deno.env.get("SERVICE_ROLE_KEY")!   // set via `supabase secrets set`
);

Deno.serve(async (req) => {
  try {
    const { templateId } = await req.json();

    const items = [
      {
        id: crypto.randomUUID(),
        type: "cloze",
        stem: "Our team will ___ the client by Friday.",
        options: ["contact", "contacts", "contacted", "contacting"],
        answer: "contact",
        metadata: { cefr: "B1", skill: "tense" }
      }
    ];

    for (const payload of items) {
      const { error } = await supabase.from("assessment_items").insert({
        template_id: templateId,
        module: "english",
        payload
      });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true, count: items.length }), {
      headers: { "content-type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
});
