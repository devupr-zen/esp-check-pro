import { memo } from "react";

type Scores = {
  reading?: number;
  listening?: number;
  grammar?: number;
  vocabulary?: number;
  meeting?: number;
  presentation?: number;
  conversation?: number;
};

export interface ESPProfile {
  track: string | null;
  level: string | null;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
  improvement_areas: string[];
  top_goals: string[];
  scores: Scores;
}

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full border px-2 py-0.5 text-xs mr-2 mb-2">
      {children}
    </span>
  );
}

const Bar = ({ v = 0 }: { v?: number }) => (
  <div className="h-2 w-full rounded bg-muted">
    <div
      className="h-2 rounded bg-primary transition-all"
      style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
    />
  </div>
);

export const ESPProfileCard = memo(function ESPProfileCard({
  profile,
}: {
  profile: ESPProfile | null | undefined;
}) {
  if (!profile) {
    return (
      <div className="rounded-2xl border p-5">
        <div className="text-sm text-muted-foreground">No profile yet.</div>
      </div>
    );
  }

  const { track, level, summary, strengths, weaknesses, improvement_areas, top_goals, scores } =
    profile;

  return (
    <div className="rounded-2xl border p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">ESP Profile</h3>
          <div className="text-sm text-muted-foreground">
            {track ? `Track: ${track}` : "Track: —"} • {level ?? "Level: —"}
          </div>
        </div>
      </div>

      {summary && <p className="text-sm leading-relaxed">{summary}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Strengths</h4>
          <div>{strengths?.length ? strengths.map((s) => <Pill key={s}>{s}</Pill>) : <span className="text-sm text-muted-foreground">—</span>}</div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Weaknesses</h4>
          <div>{weaknesses?.length ? weaknesses.map((s) => <Pill key={s}>{s}</Pill>) : <span className="text-sm text-muted-foreground">—</span>}</div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Improvement Areas</h4>
          <div>{improvement_areas?.length ? improvement_areas.map((s) => <Pill key={s}>{s}</Pill>) : <span className="text-sm text-muted-foreground">—</span>}</div>
        </div>
        <div>
          <h4 className="font-medium mb-2">Top Goals</h4>
          <div>{top_goals?.length ? top_goals.map((s) => <Pill key={s}>{s}</Pill>) : <span className="text-sm text-muted-foreground">—</span>}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          ["Reading", scores.reading],
          ["Listening", scores.listening],
          ["Grammar", scores.grammar],
          ["Vocabulary", scores.vocabulary],
          ["Meeting", scores.meeting],
          ["Presentation", scores.presentation],
          ["Conversation", scores.conversation],
        ].map(([label, v]) => (
          <div key={label as string}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{label}</span>
              <span>{typeof v === "number" ? `${v}%` : "—"}</span>
            </div>
            <Bar v={v as number | undefined} />
          </div>
        ))}
      </div>
    </div>
  );
});

export default ESPProfileCard;
