"use client";
import { useCallback, useMemo, useState } from "react";
import { gestures, gestureById } from "@/data/gestures";
import { studyConfig } from "@/data/studyConfig";
import { useT } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/types";
import type { ElicitationRow, GestureId } from "@/types/study";
import type { ElicitationDraft } from "@/lib/validation/schemas";
import { api } from "@/lib/client/api";
import { useAutosave } from "@/lib/client/useAutosave";
import { Alert, Card, Field, Modal, SaveIndicator, TextArea } from "@/components/ui";
import { GestureGrid } from "@/components/study/GestureGrid";

export function draftFromRow(e: ElicitationRow | null): ElicitationDraft {
  return { selected: e?.selected_gestures ?? [], best: e?.best_gesture ?? null, reason: e?.reason ?? "", excluded: e?.excluded_gestures ?? [], exclusionReason: e?.exclusion_reason ?? "" };
}

function validate(d: ElicitationDraft, msg: Dictionary["phaseA"]["errors"]): Record<string, string> {
  const errs: Record<string, string> = {};
  if (d.selected.length < 1) errs.selected = msg.selectAtLeastOne;
  if (!d.best || !d.selected.includes(d.best)) errs.best = msg.chooseBest;
  if (studyConfig.elicitation.requireReason && d.reason.trim().length < studyConfig.elicitation.minReasonChars) errs.reason = msg.giveReason;
  if (d.excluded.length > 0 && d.exclusionReason.trim().length === 0) errs.exclusionReason = msg.whyExcluded;
  return errs;
}

/**
 * Phase A: independent elicitation. Autosaves drafts; the submit button opens the confirmation modal; on confirm the
 * draft is flushed and the trial locked server-side. Once `locked`, every input is read-only.
 */
export function PhaseAForm({ trialOrder, initial, locked, onLocked }: { trialOrder: number; initial: ElicitationRow | null; locked: boolean; onLocked: () => Promise<void> }) {
  const t = useT();
  const q = t.phaseA;
  const name = (id: GestureId) => t.gestures[id]?.label ?? gestureById[id].label;
  const [draft, setDraft] = useState<ElicitationDraft>(() => draftFromRow(initial));
  const [showErrors, setShowErrors] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const save = useCallback(async (d: ElicitationDraft) => { await api(`/api/trials/${trialOrder}/elicitation`, { method: "PUT", body: d }); }, [trialOrder]);
  const { status, error, flush } = useAutosave(draft, save, { enabled: !locked });
  const errors = useMemo(() => validate(draft, q.errors), [draft, q.errors]);

  const toggleSelected = (id: GestureId) => setDraft((d) => {
    const selected = d.selected.includes(id) ? d.selected.filter((g) => g !== id) : [...d.selected, id].sort((a, b) => gestureById[a].number - gestureById[b].number);
    return { ...d, selected, best: d.best && selected.includes(d.best) ? d.best : null, excluded: d.excluded.filter((g) => g !== id) };
  });
  const toggleExcluded = (id: GestureId) => setDraft((d) => ({ ...d, excluded: d.excluded.includes(id) ? d.excluded.filter((g) => g !== id) : [...d.excluded, id].sort((a, b) => gestureById[a].number - gestureById[b].number) }));

  const onSubmitClick = () => { setShowErrors(true); if (Object.keys(errors).length === 0) setConfirm(true); };
  const onConfirm = async () => {
    setSubmitting(true); setSubmitError(null);
    try {
      await flush();
      await api(`/api/trials/${trialOrder}/lock`, { method: "POST", body: draft });
      setConfirm(false);
      await onLocked();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : q.errors.couldNotSubmit);
    } finally { setSubmitting(false); }
  };

  const selectable = gestures.filter((g) => !draft.selected.includes(g.id));
  return (
    <div className="space-y-4">
      <Card title={<>Q1. {q.q1}</>} aside={!locked && <SaveIndicator status={status} error={error} />}>
        <GestureGrid mode={locked ? "readonly" : "select"} selected={draft.selected} best={draft.best} excluded={draft.excluded} onToggle={locked ? undefined : toggleSelected} />
        {showErrors && errors.selected && <p role="alert" className="mt-2 text-sm text-warn">{errors.selected}</p>}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card title={<>Q2. {q.q2}</>}>
          <p className="help mb-2">{q.q2Help}</p>
          {draft.selected.length === 0 ? (
            <p className="text-sm text-muted">{q.selectInQ1First}</p>
          ) : (
            <fieldset disabled={locked} className="flex flex-wrap gap-2">
              <legend className="sr-only">{q.q2}</legend>
              {draft.selected.map((id) => (
                <label key={id} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${draft.best === id ? "border-ops bg-ops-soft font-semibold" : "border-line bg-white"}`}>
                  <input type="radio" name="best" value={id} checked={draft.best === id} onChange={() => setDraft((d) => ({ ...d, best: id }))} className="h-4 w-4 accent-ops" />
                  {name(id)}
                </label>
              ))}
            </fieldset>
          )}
          {showErrors && errors.best && <p role="alert" className="mt-2 text-sm text-warn">{errors.best}</p>}
        </Card>

        <Card>
          <Field id="q3" label={<>Q3. {q.q3}</>} required error={showErrors ? errors.reason ?? null : null}>
            <TextArea id="q3" value={draft.reason} onChange={(v) => setDraft((d) => ({ ...d, reason: v }))} disabled={locked} rows={5} required />
          </Field>
        </Card>
      </div>

      <Card title={<>Q4. {q.q4}</>}>
        <p className="help mb-2">{q.q4Help}</p>
        <fieldset disabled={locked} className="flex flex-wrap gap-2">
          <legend className="sr-only">{q.q4}</legend>
          {selectable.map((g) => (
            <label key={g.id} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${draft.excluded.includes(g.id) ? "border-slate-500 bg-slate-100 font-semibold" : "border-line bg-white"}`}>
              <input type="checkbox" checked={draft.excluded.includes(g.id)} onChange={() => toggleExcluded(g.id)} className="h-4 w-4 accent-slate-600" />
              {name(g.id)}
            </label>
          ))}
        </fieldset>
        {draft.excluded.length > 0 && (
          <div className="mt-3">
            <Field id="q4why" label={q.q4Why} required error={showErrors ? errors.exclusionReason ?? null : null}>
              <TextArea id="q4why" value={draft.exclusionReason} onChange={(v) => setDraft((d) => ({ ...d, exclusionReason: v }))} disabled={locked} rows={3} />
            </Field>
          </div>
        )}
      </Card>

      {locked ? (
        <Alert kind="info">{t.trial.locked}</Alert>
      ) : (
        <div className="flex items-center justify-end gap-3">
          {showErrors && Object.keys(errors).length > 0 && <span className="text-sm text-warn">{q.completeRequired}</span>}
          <button type="button" className="btn-primary" onClick={onSubmitClick} disabled={submitting}>{q.submit}</button>
        </div>
      )}

      <Modal open={confirm} title={q.confirmTitle} onClose={() => { if (!submitting) setConfirm(false); }}
        actions={<>
          <button type="button" className="btn-secondary" onClick={() => setConfirm(false)} disabled={submitting}>{q.confirmNo}</button>
          <button type="button" className="btn-primary" onClick={onConfirm} disabled={submitting}>{submitting ? q.submitting : q.confirmYes}</button>
        </>}>
        <p>{q.confirmBody}</p>
        {draft.best && <p className="mt-2">{q.summaryBefore}<strong>{name(draft.best)}</strong>{q.summaryAfter(draft.selected.length)}</p>}
        {submitError && <div className="mt-3"><Alert kind="error">{submitError}</Alert></div>}
      </Modal>
    </div>
  );
}
