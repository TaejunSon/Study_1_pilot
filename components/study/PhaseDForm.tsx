"use client";
import { useCallback, useState } from "react";
import { useT } from "@/lib/i18n/client";
import type { QualitativeRow } from "@/types/study";
import type { PhaseDKey } from "@/lib/i18n/types";
import type { ReflectionDraft } from "@/lib/validation/schemas";
import { api } from "@/lib/client/api";
import { useAutosave } from "@/lib/client/useAutosave";
import { Alert, Card, Field, SaveIndicator, TextArea } from "@/components/ui";

type Vals = Omit<ReflectionDraft, "submit">;
const fromRow = (q: QualitativeRow | null): Vals => ({ system_reason: q?.system_reason ?? "", scene_evidence: q?.scene_evidence ?? "", contrast_reason: q?.contrast_reason ?? "", generalization: q?.generalization ?? "" });

/**
 * Phase D: the same four questions in every trial for every participant (decision 2026-09-23) - recommendation
 * rationale, scene evidence, neutral human-system comparison, generalization. `probing` is no longer used to decide
 * what is shown; its reasons are still recorded on the server for analysis.
 */
export function PhaseDForm({ trialOrder, initial, onCompleted, onBack }: { trialOrder: number; initial: QualitativeRow | null; onCompleted: (nextPath: string) => void; onBack: () => Promise<void> }) {
  const t = useT();
  const q = t.phaseD;
  const [vals, setVals] = useState<Vals>(() => fromRow(initial));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = useCallback(async (v: Vals) => { await api(`/api/trials/${trialOrder}/reflection`, { method: "PUT", body: { ...v, submit: false } }); }, [trialOrder]);
  const { status, error, flush } = useAutosave(vals, save);
  const filled = (s: string) => s.trim().length > 0;
  const complete = filled(vals.system_reason) && filled(vals.scene_evidence) && filled(vals.contrast_reason) && filled(vals.generalization);
  const label = (k: PhaseDKey) => (<><span className="text-xs uppercase tracking-wide text-muted">{k.toUpperCase()} · {q.titles[k]}</span><br />{q[k]}</>);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      await flush();
      const r = await api<{ nextPath: string }>(`/api/trials/${trialOrder}/reflection`, { method: "PUT", body: { ...vals, submit: true } });
      onCompleted(r.nextPath);
    } catch (e) { setErr(e instanceof Error ? e.message : q.couldNotComplete); setBusy(false); }
  };

  const set = (k: keyof Vals) => (v: string) => setVals((s) => ({ ...s, [k]: v }));
  return (
    <Card title={q.title} aside={<SaveIndicator status={status} error={error} />}>
      <div className="space-y-4">
        <Field id="q10" label={label("q10")} required><TextArea id="q10" rows={3} value={vals.system_reason} onChange={set("system_reason")} required /></Field>
        <Field id="q11" label={label("q11")} required><TextArea id="q11" rows={3} value={vals.scene_evidence} onChange={set("scene_evidence")} required /></Field>
        <Field id="q12" label={label("q12")} required><TextArea id="q12" rows={3} value={vals.contrast_reason} onChange={set("contrast_reason")} required /></Field>
        <Field id="q13" label={label("q13")} required><TextArea id="q13" rows={3} value={vals.generalization} onChange={set("generalization")} required /></Field>
        {err && <Alert kind="error">{err}</Alert>}
        <div className="flex items-center justify-between">
          <button type="button" className="btn-secondary" onClick={() => void onBack()} disabled={busy}>{q.backToRatings}</button>
          <div className="flex items-center gap-3">
            {!complete && <span className="text-sm text-muted">{q.answerAll}</span>}
            <button type="button" className="btn-primary" disabled={!complete || busy} onClick={submit}>{busy ? t.ui.saving : q.submit}</button>
          </div>
        </div>
      </div>
    </Card>
  );
}
