"use client";
import { gestureById } from "@/data/gestures";
import { useT } from "@/lib/i18n/client";
import type { GestureId, RecommendationView } from "@/types/study";
import { GestureIcon } from "@/components/study/GestureIcon";

/** Shown only after the elicitation is locked. Source/model details are not shown to participants. */
export function RecommendationPanel({ recommendation, best }: { recommendation: RecommendationView; best: GestureId | null }) {
  const t = useT();
  const sys = gestureById[recommendation.gesture];
  const mine = best ? gestureById[best] : null;
  const text = (id: GestureId) => t.gestures[id] ?? gestureById[id];
  return (
    <div className="card grid grid-cols-2 gap-4 p-4">
      <div className="flex items-center gap-3 rounded-md border-2 border-accent bg-accent-soft/40 p-3">
        <GestureIcon id={sys.id} className="h-14 w-14 shrink-0" />
        <div>
          <div className="text-xs uppercase tracking-wide text-accent">{t.trial.systemGesture}</div>
          <div className="text-lg font-semibold">{text(sys.id).label}</div>
          <div className="text-xs text-muted">{sys.family} {sys.number} · {text(sys.id).description}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-md border border-line p-3">
        {mine && <GestureIcon id={mine.id} className="h-14 w-14 shrink-0" />}
        <div>
          <div className="text-xs uppercase tracking-wide text-muted">{t.trial.yourBest}</div>
          <div className="text-lg font-semibold">{mine ? text(mine.id).label : "—"}</div>
          {mine && <div className="text-xs text-muted">{mine.family} {mine.number} · {text(mine.id).description}</div>}
        </div>
      </div>
    </div>
  );
}
