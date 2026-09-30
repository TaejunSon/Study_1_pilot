"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TrialPayload } from "@/types/study";
import { api, ApiError } from "@/lib/client/api";
import { usingLocalVideos } from "@/data/studyMedia";
import { useT } from "@/lib/i18n/client";
import { GateNotice, useStageGate, StudyShell } from "@/components/study/StudyShell";
import { TrialRunner } from "@/components/study/TrialRunner";
import { Alert } from "@/components/ui";

/**
 * One trial screen. The pre-rendered page knows nothing about the participant, so the payload is loaded from local
 * storage after mount; a participant who opens the wrong trial number is sent to the one they are on, which is the
 * same rule the server app enforced with a redirect.
 */
export function TrialScreen({ stage, order }: { stage: "practice" | "trials"; order: number }) {
  const t = useT();
  const router = useRouter();
  const { db, blocked } = useStageGate(stage);
  const [payload, setPayload] = useState<TrialPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;
    let cancelled = false;
    void (async () => {
      try {
        const p = await api<TrialPayload>(`/api/trials/${order}`);
        if (!cancelled) setPayload(p);
      } catch (e) {
        if (cancelled) return;
        const redirect = e instanceof ApiError ? (e.data as { redirect?: string } | undefined)?.redirect : undefined;
        if (redirect) router.replace(redirect);
        else setErr(e instanceof Error ? e.message : t.ui.somethingWrong);
      }
    })();
    return () => { cancelled = true; };
  }, [db, order, router, t.ui.somethingWrong]);

  return (
    <StudyShell db={db}>
      {usingLocalVideos && (
        <Alert kind="warn">
          This build has no video host configured (NEXT_PUBLIC_VIDEO_BASE_URL), so the clips are being loaded from
          this site. If the panel below is black, the clips are missing — tell the experimenter before continuing.
        </Alert>
      )}
      {err && <Alert kind="error">{err}</Alert>}
      {!db ? <GateNotice blocked={blocked ?? "loading"} /> : payload ? <TrialRunner key={payload.trial.id} initial={payload} /> : !err ? <GateNotice blocked="loading" /> : null}
    </StudyShell>
  );
}
