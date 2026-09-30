"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Stage } from "@/types/study";
import type { LocalDb } from "@/lib/local/state";
import { loadCurrent, storageAvailable } from "@/lib/local/state";
import { pathForStage } from "@/lib/study/flow";
import { useT, LocaleToggle } from "@/lib/i18n/client";
import { Alert, Spinner } from "@/components/ui";

/**
 * Stage gate for a participant page. The server app enforced the linear flow in a server guard that redirected;
 * here the same rule runs after mount, because the page HTML is pre-rendered and knows nothing about who is using
 * it. A participant on the wrong page is sent to the one their stored stage allows.
 *
 * `null` while it is still deciding, so pages render a placeholder instead of flashing the wrong screen.
 */
export function useStageGate(stage: Stage): { db: LocalDb | null; blocked: "loading" | "no-storage" | "no-session" | null } {
  const router = useRouter();
  const [db, setDb] = useState<LocalDb | null>(null);
  const [blocked, setBlocked] = useState<"loading" | "no-storage" | "no-session" | null>("loading");

  useEffect(() => {
    if (!storageAvailable()) { setBlocked("no-storage"); return; }
    const found = loadCurrent();
    if (!found) { setBlocked("no-session"); router.replace("/"); return; }
    if (found.participant.stage !== stage) { router.replace(pathForStage(found.participant)); return; }
    setDb(found);
    setBlocked(null);
  }, [stage, router]);

  return { db, blocked };
}

/** Shell for every participant page: study name, language switch, participant ID and stage. The flow is linear, so there is no navigation. */
export function StudyShell({ db, children }: { db: LocalDb | null; children: React.ReactNode }) {
  const t = useT();
  const p = db?.participant ?? null;
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-5">
      <header className="mb-5 flex items-center justify-between border-b border-line pb-3 text-sm">
        <span className="font-semibold">{t.studyName}</span>
        <span className="flex items-center gap-4 text-muted">
          {p ? <span>{t.header.participant} <span className="font-mono text-ink">{p.id}</span> · {t.header.stages[p.stage]}</span> : null}
          <LocaleToggle />
        </span>
      </header>
      <main>{children}</main>
    </div>
  );
}

/** What a gated page shows while the gate has not let it through. */
export function GateNotice({ blocked }: { blocked: "loading" | "no-storage" | "no-session" }) {
  const t = useT();
  if (blocked === "no-storage") {
    return (
      <Alert kind="error">
        This browser is blocking local storage, so your answers cannot be saved. Turn off private browsing or allow
        site data for this page, then reload.
        <br />
        이 브라우저가 로컬 저장소를 차단하고 있어 응답을 저장할 수 없습니다. 시크릿 모드를 끄거나 이 페이지의 사이트 데이터를 허용한 뒤 새로고침해 주세요.
      </Alert>
    );
  }
  return <div className="py-10"><Spinner label={blocked === "no-session" ? t.ui.saving : t.ui.saving} /></div>;
}

/** Convenience wrapper: gate + shell + loading state in one. */
export function GatedPage({ stage, children }: { stage: Stage; children: (db: LocalDb) => React.ReactNode }) {
  const { db, blocked } = useStageGate(stage);
  return <StudyShell db={db}>{db ? children(db) : <GateNotice blocked={blocked ?? "loading"} />}</StudyShell>;
}
