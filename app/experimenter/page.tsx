"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { deleteParticipant, listParticipantIds, loadDb, storageAvailable, type LocalDb } from "@/lib/local/state";
import { combinedCsv, csvName, download, jsonName, participantCsv, participantJson } from "@/lib/export/localExport";
import { LocaleToggle, useT } from "@/lib/i18n/client";
import { Alert } from "@/components/ui";

/**
 * Experimenter page: everything stored in THIS browser, and the exports.
 *
 * It deliberately does not show the stored recommendations. The page is reachable from the landing page without a
 * password (a static site has no way to check one), so anything it displays is something a participant could see
 * before their own choice is locked.
 */
export default function ExperimenterPage() {
  const t = useT();
  const [dbs, setDbs] = useState<LocalDb[]>([]);
  const [ready, setReady] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!storageAvailable()) { setReady(true); return; }
    setDbs(listParticipantIds().map(loadDb).filter((d): d is LocalDb => d !== null));
    setReady(true);
  }, []);

  useEffect(refresh, [refresh]);

  const done = (db: LocalDb) => db.trials.filter((x) => !x.is_practice && x.phase === "completed").length;
  const total = (db: LocalDb) => (db.participant.trial_order ?? []).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t.landing.experimenterInterface}</h1>
          <p className="mt-1 text-sm text-muted">
            Responses are stored in this browser only. Export them before the machine is cleared or handed on.
          </p>
        </div>
        <LocaleToggle className="mt-1 shrink-0" />
      </div>

      {!ready ? null : !storageAvailable() ? (
        <div className="mt-6"><Alert kind="error">This browser is blocking local storage, so nothing can be read or recorded here.</Alert></div>
      ) : dbs.length === 0 ? (
        <div className="mt-6"><Alert kind="info">{t.exportPanel.nothingToExport}</Alert></div>
      ) : (
        <>
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-muted">
                <tr>
                  <th className="p-3">Participant</th><th className="p-3">Block</th><th className="p-3">Stage</th>
                  <th className="p-3">Trials</th><th className="p-3">Started</th><th className="p-3">Export</th><th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {dbs.map((db) => (
                  <tr key={db.participant.id} className="border-b border-line/60 last:border-0">
                    <td className="p-3 font-mono">{db.participant.id}</td>
                    <td className="p-3">{t.blocks[db.blockId]}</td>
                    <td className="p-3">{t.header.stages[db.participant.stage]}</td>
                    <td className="p-3 tabular-nums">{done(db)} / {total(db)}</td>
                    <td className="p-3 text-muted">{new Date(db.participant.created_at).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="flex gap-2">
                        <button type="button" className="btn-secondary !py-1" onClick={() => download(csvName(db.participant.id), participantCsv(db), "text/csv")}>CSV</button>
                        <button type="button" className="btn-secondary !py-1" onClick={() => download(jsonName(db.participant.id), participantJson(db), "application/json")}>JSON</button>
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {confirmId === db.participant.id ? (
                        <span className="flex justify-end gap-2">
                          <button type="button" className="btn-secondary !py-1" onClick={() => setConfirmId(null)}>Cancel</button>
                          <button type="button" className="btn-primary !py-1" onClick={() => { deleteParticipant(db.participant.id); setConfirmId(null); refresh(); }}>Delete permanently</button>
                        </span>
                      ) : (
                        <button type="button" className="text-xs text-muted underline" onClick={() => setConfirmId(db.participant.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button type="button" className="btn-primary"
              onClick={() => download(`expert-study_all_${new Date().toISOString().slice(0, 10)}.csv`, combinedCsv(dbs.map((d) => d.participant.id)), "text/csv")}>
              Download all participants (CSV)
            </button>
            <span className="text-sm text-muted">{dbs.length} participant{dbs.length === 1 ? "" : "s"} in this browser</span>
          </div>

          <p className="mt-6 text-sm text-muted">
            Deleting is permanent and cannot be undone — export first. Clearing the browser&apos;s site data removes
            every participant listed here.
          </p>
        </>
      )}

      <p className="mt-10 text-xs text-muted"><Link href="/" className="underline">← Study start</Link></p>
    </div>
  );
}
