"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { TrialPayload } from "@/types/study";
import { api } from "@/lib/client/api";
import { useT } from "@/lib/i18n/client";
import { Alert, Card, ProgressBar, Spinner } from "@/components/ui";
import { VideoPanel } from "@/components/study/VideoPanel";
import { CommandBadge } from "@/components/study/CommandBadge";
import { GestureGrid } from "@/components/study/GestureGrid";
import { RecommendationPanel } from "@/components/study/RecommendationPanel";
import { PhaseAForm } from "@/components/study/PhaseAForm";
import { PhaseCForm } from "@/components/study/PhaseCForm";
import { PhaseDForm } from "@/components/study/PhaseDForm";

/**
 * Drives one trial through its phases. The payload from the server is the single source of truth: after every
 * transition the server returns the updated payload (the recommendation only appears once the lock is recorded).
 */
export function TrialRunner({ initial }: { initial: TrialPayload }) {
  const t = useT();
  const router = useRouter();
  const [p, setP] = useState<TrialPayload>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const order = p.trial.trial_order;
  const locked = !!p.elicitation?.locked;

  const reload = useCallback(async () => {
    const next = await api<TrialPayload>(`/api/trials/${order}`);
    setP(next);
    return next;
  }, [order]);

  const retryReveal = async () => {
    setBusy(true); setErr(null);
    try { await api(`/api/trials/${order}/lock`, { method: "POST", body: null }); await reload(); }
    catch (e) { setErr(e instanceof Error ? e.message : t.ui.couldNotCheck); }
    finally { setBusy(false); }
  };

  const backToRatings = async () => {
    try { await api(`/api/trials/${order}/evaluation/back`, { method: "POST", body: {} }); await reload(); }
    catch (e) { setErr(e instanceof Error ? e.message : t.ui.couldNotGoBack); }
  };

  const goNext = (path: string) => {
    if (p.trial.is_practice) { setP((s) => ({ ...s, trial: { ...s.trial, phase: "completed" } })); (window as unknown as { __next?: string }).__next = path; return; }
    router.push(path);
    router.refresh();
  };

  const isPractice = p.trial.is_practice;
  const title = isPractice ? t.trial.practiceTitle : t.trial.trialTitle(p.index, p.total);
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title} <span className="ml-2 text-base font-normal text-muted">· {t.trial.phaseLabel[p.trial.phase]}</span></h1>
        {!isPractice && <ProgressBar value={p.index - 1} max={p.total} label={t.trial.progress(p.index - 1, p.total)} />}
      </header>
      {isPractice && <Alert kind="warn">{t.practice.banner}</Alert>}

      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
        <VideoPanel src={p.scene.videoPath} targetObject={p.scene.targetObject} />
        <div className="space-y-4">
          <CommandBadge command={p.command} targetObject={p.scene.targetObject} />
          {locked && p.recommendation && <RecommendationPanel recommendation={p.recommendation} best={p.elicitation?.best_gesture ?? null} />}
          {locked && !p.recommendation && (
            <Card>
              <Alert kind="warn">{t.trial.awaiting}</Alert>
              <div className="mt-3 flex items-center gap-3">
                <button type="button" className="btn-secondary" onClick={retryReveal} disabled={busy}>{t.trial.retry}</button>
                {busy && <Spinner label={t.trial.checking} />}
              </div>
            </Card>
          )}
          {err && <Alert kind="error">{err}</Alert>}
        </div>
      </div>

      {p.trial.phase === "elicitation" || p.trial.phase === "awaiting_recommendation" ? (
        <PhaseAForm trialOrder={order} initial={p.elicitation} locked={locked} onLocked={async () => { await reload(); }} />
      ) : null}

      {p.trial.phase === "evaluation" && p.recommendation && (
        <>
          <Card title={t.trial.submittedReadonly}>
            <GestureGrid mode="readonly" selected={p.elicitation?.selected_gestures ?? []} best={p.elicitation?.best_gesture ?? null} excluded={p.elicitation?.excluded_gestures ?? []} system={p.recommendation.gesture} showFamilyHeaders={false} />
          </Card>
          <PhaseCForm trialOrder={order} initial={p.ratings} onSubmitted={(next) => setP(next)} />
        </>
      )}

      {p.trial.phase === "reflection" && (
        <PhaseDForm trialOrder={order} initial={p.qualitative} onCompleted={goNext} onBack={backToRatings} />
      )}

      {p.trial.phase === "completed" && (
        <Card>
          <Alert kind="success">{isPractice ? t.practice.done : t.trial.completed}</Alert>
          <div className="mt-3 flex justify-end">
            <button type="button" className="btn-primary" onClick={() => { const n = (window as unknown as { __next?: string }).__next ?? (isPractice ? "/trial/1" : `/trial/${p.index + 1}`); router.push(n); router.refresh(); }}>
              {isPractice ? t.practice.continue : t.trial.nextTrial}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
