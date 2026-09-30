"use client";
import { useCallback, useState } from "react";
import { studyConfig } from "@/data/studyConfig";
import { useT } from "@/lib/i18n/client";
import type { RatingsRow, TrialPayload, Verdict } from "@/types/study";
import type { RatingsDraft } from "@/lib/validation/schemas";
import { api } from "@/lib/client/api";
import { useAutosave } from "@/lib/client/useAutosave";
import { Alert, Card, LikertScale, RadioGroup, SaveIndicator } from "@/components/ui";

type Vals = Omit<RatingsDraft, "submit">;
const fromRow = (r: RatingsRow | null): Vals => ({ feasibility: r?.feasibility ?? null, task_compatibility: r?.task_compatibility ?? null, safety: r?.safety ?? null, semantic_compatibility: r?.semantic_compatibility ?? null, verdict: r?.verdict ?? null });

/** Phase C: four 7-point ratings and the verdict, all visible on one screen. Drafts autosave; Continue submits. */
export function PhaseCForm({ trialOrder, initial, onSubmitted }: { trialOrder: number; initial: RatingsRow | null; onSubmitted: (p: TrialPayload) => void }) {
  const t = useT();
  const q = t.phaseC;
  const [vals, setVals] = useState<Vals>(() => fromRow(initial));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = useCallback(async (v: Vals) => { await api(`/api/trials/${trialOrder}/evaluation`, { method: "PUT", body: { ...v, submit: false } }); }, [trialOrder]);
  const { status, error, flush } = useAutosave(vals, save);
  const complete = q.likert.every((item) => vals[item.key] !== null) && vals.verdict !== null;

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      await flush();
      const p = await api<TrialPayload>(`/api/trials/${trialOrder}/evaluation`, { method: "PUT", body: { ...vals, submit: true } });
      onSubmitted(p);
    } catch (e) { setErr(e instanceof Error ? e.message : q.couldNotContinue); }
    finally { setBusy(false); }
  };

  return (
    <Card title={q.intro} aside={<SaveIndicator status={status} error={error} />}>
      <div className="space-y-3">
        {q.likert.map((item, i) => (
          <LikertScale key={item.key} title={`Q${5 + i}. ${item.title}`} prompt={item.prompt} name={item.key} value={vals[item.key]} onChange={(v) => setVals((s) => ({ ...s, [item.key]: v }))} anchors={item.anchors} min={studyConfig.likert.min} max={studyConfig.likert.max} />
        ))}
        <div className="rounded-md border border-line p-3">
          <RadioGroup<Verdict> legend={`Q9. ${q.verdictPrompt}`} name="verdict" value={vals.verdict} onChange={(v) => setVals((s) => ({ ...s, verdict: v }))} options={q.verdicts} inline />
        </div>
        {err && <Alert kind="error">{err}</Alert>}
        <div className="flex items-center justify-end gap-3">
          {!complete && <span className="text-sm text-muted">{q.answerAll}</span>}
          <button type="button" className="btn-primary" disabled={!complete || busy} onClick={submit}>{busy ? t.ui.saving : q.submit}</button>
        </div>
      </div>
    </Card>
  );
}
