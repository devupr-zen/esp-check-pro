import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  startAttempt,
  listItems,
  saveResponse,
  finalizeAttempt,
  scoreWriting,
  fetchAttempt
} from "@/lib/assessments";

export default function AssessmentRunner() {
  const [sp] = useSearchParams();
  const templateId = sp.get("templateId") || "";
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const current = useMemo(() => items[idx], [items, idx]);

  useEffect(() => {
    (async () => {
      if (!templateId) return;
      const id = await startAttempt(templateId);
      setAttemptId(id);
      const it = await listItems(templateId);
      setItems(it);
    })();
  }, [templateId]);

  async function onChoose(opt: string) {
    if (!attemptId || !current) return;
    await saveResponse(attemptId, current.id, { answer: opt });
    if (idx < items.length - 1) setIdx((v) => v + 1);
    else await onSubmit();
  }

  async function onSubmit() {
    await finalizeAttempt(attemptId);
    await scoreWriting(attemptId);
    const done = await fetchAttempt(attemptId);
    navigate(`/student/assessments/${done.id}`);
  }

  if (!templateId) return <div className="p-6">Missing templateId.</div>;
  if (!current) return <div className="p-6">Loading items…</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Assessment</h1>
      <div className="rounded-2xl border p-5">
        <p className="mb-4">{current?.payload?.stem}</p>
        <div className="grid gap-2">
          {current?.payload?.options?.map((opt: string) => (
            <button
              key={opt}
              onClick={() => onChoose(opt)}
              className="rounded-xl border px-4 py-2 text-left hover:bg-accent"
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Item {idx + 1} / {items.length}
        </div>
      </div>
    </div>
  );
}
