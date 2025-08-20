import { supabase } from "@/lib/supabase";

/** Start a new attempt for the current authenticated user (RPC security-definer). */
export async function startAttempt(templateId: string): Promise<string> {
  if (!templateId) throw new Error("templateId is required");
  const { data, error } = await supabase.rpc("start_attempt", {
    p_template: templateId
  });
  if (error) throw error;
  return data as string;
}

/** List items for a template (teacher-visible or public as per RLS). */
export async function listItems(templateId: string) {
  if (!templateId) throw new Error("templateId is required");
  const { data, error } = await supabase
    .from("assessment_items")
    .select("id, module, payload")
    .eq("template_id", templateId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Save/append a response for the current attempt. */
export async function saveResponse(
  attemptId: string,
  itemId: string,
  response: unknown,
  timeMs = 0
) {
  if (!attemptId || !itemId) throw new Error("attemptId and itemId are required");
  const { error } = await supabase.rpc("upsert_response", {
    p_attempt: attemptId,
    p_item: itemId,
    p_resp: response,
    p_time_ms: timeMs
  });
  if (error) throw error;
}

/** Mark attempt as submitted (locks it). */
export async function finalizeAttempt(attemptId: string) {
  if (!attemptId) throw new Error("attemptId is required");
  const { error } = await supabase.rpc("finalize_attempt", { p_attempt: attemptId });
  if (error) throw error;
}

/** Call Edge Function to score writing (stub now; OpenAI later). */
export async function scoreWriting(attemptId: string) {
  if (!attemptId) throw new Error("attemptId is required");
  const { data, error } = await supabase.functions.invoke("score-writing", {
    body: { attemptId }
  });
  if (error) throw error;
  return data;
}

/** Fetch the latest attempt record (for result page). */
export async function fetchAttempt(attemptId: string) {
  if (!attemptId) throw new Error("attemptId is required");
  const { data, error } = await supabase
    .from("assessment_attempts")
    .select("*")
    .eq("id", attemptId)
    .single();
  if (error) throw error;
  return data;
}

/** Optional: list a student's attempts (for Student Progress). */
export async function listMyAttempts() {
  const { data, error } = await supabase
    .from("assessment_attempts")
    .select("id, template_id, status, score, subscores, started_at, submitted_at")
    .order("started_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Optional: teacher view – list attempts for a template (RLS must allow). */
export async function listTemplateAttempts(templateId: string) {
  const { data, error } = await supabase
    .from("assessment_attempts")
    .select("id, student_id, status, score, submitted_at")
    .eq("template_id", templateId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
