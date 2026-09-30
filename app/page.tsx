"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startParticipant } from "@/lib/local/engine";
import { currentParticipantId, loadDb, storageAvailable } from "@/lib/local/state";
import { blocksWithRecommendations } from "@/lib/local/recommendations";
import { blockById } from "@/data/commandBlocks";
import { commandById } from "@/data/commands";
import { useT, LocaleToggle } from "@/lib/i18n/client";
import { ApiError } from "@/lib/client/api";
import type { BlockId } from "@/types/study";
import { Alert, Field } from "@/components/ui";

const AVAILABLE = blocksWithRecommendations();

/**
 * Landing page: participant ID and the command block for this session.
 *
 * The block is chosen here rather than assigned per scene, because a participant runs all 18 situations with one
 * block's three commands. Both blocks were precomputed with the same contract, so either can run offline.
 */
export default function LandingPage() {
  const t = useT();
  const router = useRouter();
  const [id, setId] = useState("");
  const [blockId, setBlockId] = useState<BlockId>(AVAILABLE[0] ?? "NAV");
  const [resume, setResume] = useState<{ id: string; blockId: BlockId } | null>(null);
  const [existing, setExisting] = useState<BlockId | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [noStorage, setNoStorage] = useState(false);

  useEffect(() => {
    if (!storageAvailable()) { setNoStorage(true); return; }
    const cur = currentParticipantId();
    const db = cur ? loadDb(cur) : null;
    if (db) { setResume({ id: db.participant.id, blockId: db.blockId }); setId(db.participant.id); setBlockId(db.blockId); }
  }, []);

  // typing an ID that already exists in this browser reopens it with its own block
  useEffect(() => {
    if (!storageAvailable()) return;
    const db = id.trim() ? loadDb(id.trim()) : null;
    setExisting(db ? db.blockId : null);
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const r = startParticipant(id.trim(), blockId);
      router.push(r.nextPath);
    } catch (e2) {
      setErr(e2 instanceof ApiError || e2 instanceof Error ? e2.message : t.ui.somethingWrong);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">{t.landing.subtitle}</p>
          <h1 className="mt-1 text-3xl font-semibold">{t.landing.title}</h1>
        </div>
        <LocaleToggle className="mt-1 shrink-0" />
      </div>
      <div className="mt-6 space-y-3 text-[15px] leading-relaxed">
        {t.landing.body.map((s, i) => <p key={i}>{s}</p>)}
      </div>

      <div className="card mt-8 p-6">
        {noStorage ? (
          <Alert kind="error">
            This browser is blocking local storage, so the study cannot record your answers. Turn off private
            browsing or allow site data for this page, then reload.
            <br />
            이 브라우저가 로컬 저장소를 차단하고 있어 응답을 기록할 수 없습니다. 시크릿 모드를 끄거나 사이트 데이터를 허용한 뒤 새로고침해 주세요.
          </Alert>
        ) : (
          <form className="space-y-5" onSubmit={submit}>
            <Field id="pid" label={t.landing.idLabel} required>
              <input id="pid" className="input max-w-xs" value={id} onChange={(e) => setId(e.target.value)}
                placeholder={t.landing.idPlaceholder} autoComplete="off" required pattern="[A-Za-z0-9_-]{1,32}" />
            </Field>

            <fieldset className="space-y-2" disabled={!!existing}>
              <legend className="label">{t.blockChoice.legend} <span aria-hidden className="text-warn">*</span></legend>
              <p className="help">{t.blockChoice.help}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {AVAILABLE.map((b) => {
                  const chosen = (existing ?? blockId) === b;
                  return (
                    <label key={b} className={`flex cursor-pointer gap-2 rounded-md border p-3 text-sm ${chosen ? "border-accent bg-accent-soft/40" : "border-line bg-white"}`}>
                      <input type="radio" name="block" value={b} checked={chosen} onChange={() => setBlockId(b)} className="mt-0.5 h-4 w-4 accent-accent" />
                      <span>
                        <span className="font-semibold">{t.blocks[b]}</span>
                        <span className="mt-0.5 block text-muted">{t.blockChoice.blockBody[b]}</span>
                        <span className="mt-1 block text-xs text-muted">
                          {blockById[b].commands.map((c) => t.commands[c]?.label ?? commandById[c].label).join(" · ")}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {existing && <Alert kind="info">{t.landing.resumeBefore}<strong>{id.trim()}</strong>{t.landing.resumeAfter}</Alert>}
            {!existing && resume && <Alert kind="info">{t.landing.resumeBefore}<strong>{resume.id}</strong>{t.landing.resumeAfter}</Alert>}
            {err && <Alert kind="error">{err}</Alert>}
            <button type="submit" className="btn-primary" disabled={busy || !id.trim()}>{busy ? t.landing.starting : t.landing.start}</button>
          </form>
        )}
      </div>

      <p className="mt-8 text-xs text-muted">
        <Link href="/experimenter" className="underline">{t.landing.experimenterInterface}</Link>
      </p>
    </div>
  );
}
