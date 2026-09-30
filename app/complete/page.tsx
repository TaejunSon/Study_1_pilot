"use client";
import { useState } from "react";
import { GatedPage } from "@/components/study/StudyShell";
import { useT } from "@/lib/i18n/client";
import { RETURN_ADDRESS } from "@/data/studySettings";
import { csvName, download, jsonName, participantCsv, participantJson } from "@/lib/export/localExport";
import { Alert } from "@/components/ui";

/**
 * Completion page. In this build it is also the hand-over point: the responses exist only in this browser, so the
 * participant downloads them here and sends the file on. The download is offered before the thank-you text so it
 * cannot be missed.
 */
export default function CompletePage() {
  const t = useT();
  const [done, setDone] = useState(false);

  return (
    <GatedPage stage="complete">
      {(db) => (
        <div className="mx-auto max-w-2xl py-10">
          <h1 className="text-3xl font-semibold">{t.completion.title}</h1>

          <div className="card mt-5 border-2 border-accent p-6">
            <h2 className="text-lg font-semibold">{t.exportPanel.title}</h2>
            <div className="mt-2 space-y-2 text-[15px] leading-relaxed">
              {t.exportPanel.body.map((s, i) => <p key={i}>{s}</p>)}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary"
                onClick={() => { download(csvName(db.participant.id), participantCsv(db), "text/csv"); setDone(true); }}>
                {t.exportPanel.downloadCsv}
              </button>
              <button type="button" className="btn-secondary"
                onClick={() => { download(jsonName(db.participant.id), participantJson(db), "application/json"); setDone(true); }}>
                {t.exportPanel.downloadJson}
              </button>
            </div>
            {RETURN_ADDRESS && (
              <p className="mt-3 text-sm text-muted">{t.exportPanel.sendTo} <span className="font-mono">{RETURN_ADDRESS}</span></p>
            )}
            {done && <div className="mt-3"><Alert kind="success">{t.exportPanel.downloaded}</Alert></div>}
          </div>

          <div className="card mt-5 space-y-3 p-6 text-[15px] leading-relaxed">
            {t.completion.body.map((s, i) => <p key={i}>{s}</p>)}
            <p className="text-sm text-muted">
              {t.completion.participantId} <span className="font-mono">{db.participant.id}</span> · {t.completion.completedAt}{" "}
              {db.participant.completed_at ? new Date(db.participant.completed_at).toLocaleString() : ""}
            </p>
          </div>
        </div>
      )}
    </GatedPage>
  );
}
