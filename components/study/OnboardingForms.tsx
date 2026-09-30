"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { studyConfig } from "@/data/studyConfig";
import { tutorialText } from "@/data/text";
import { useT } from "@/lib/i18n/client";
import type { BackgroundData, ExpertiseCategory } from "@/types/study";
import { Alert, Field, LikertScale, TextArea } from "@/components/ui";

function useSubmit<T>(fn: (v: T) => Promise<string>, fallbackMessage: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async (v: T) => {
    setBusy(true); setErr(null);
    try { const next = await fn(v); router.push(next); router.refresh(); }
    catch (e) { setErr(e instanceof Error ? e.message : fallbackMessage); setBusy(false); }
  };
  return { busy, err, run };
}

// The landing page's start form lives in app/page.tsx in this build: it also chooses the command block, and it
// writes the participant straight to local storage instead of posting to /api/participants.

// ---------------------------------------------------------------- consent
export function ConsentForm() {
  const t = useT();
  const [agreed, setAgreed] = useState(false);
  const { busy, err, run } = useSubmit<boolean>(async () => {
    const r = await api<{ nextPath: string }>("/api/consent", { body: { agreed: true, consentVersion: studyConfig.consentVersion } });
    return r.nextPath;
  }, t.ui.somethingWrong);
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void run(true); }}>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-accent" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
        <span>{t.consent.checkbox}</span>
      </label>
      {err && <Alert kind="error">{err}</Alert>}
      <button type="submit" className="btn-primary" disabled={!agreed || busy}>{busy ? t.ui.saving : t.consent.agree}</button>
    </form>
  );
}

// ---------------------------------------------------------------- background
export function BackgroundForm({ initial }: { initial: BackgroundData | null }) {
  const t = useT();
  const b = t.background;
  const [v, setV] = useState<BackgroundData>(initial ?? { role: "", roleOther: "", hciYears: 0, xrYears: 0, gestureYears: 0, categories: [], categoriesOther: "", expertise: "" });
  const { busy, err, run } = useSubmit<BackgroundData>(async (data) => {
    const r = await api<{ nextPath: string }>("/api/background", { body: data });
    return r.nextPath;
  }, t.ui.somethingWrong);
  const toggleCat = (c: ExpertiseCategory) => setV((s) => ({ ...s, categories: s.categories.includes(c) ? s.categories.filter((x) => x !== c) : [...s.categories, c] }));
  const num = (k: "hciYears" | "xrYears" | "gestureYears") => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.value === "" ? 0 : Number(e.target.value) }));
  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void run(v); }}>
      <Field id="role" label={b.role} required>
        <select id="role" className="input max-w-sm" value={v.role} onChange={(e) => setV((s) => ({ ...s, role: e.target.value }))} required>
          <option value="">{b.selectPlaceholder}</option>
          {b.roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </Field>
      {v.role === "other" && (
        <Field id="roleOther" label={b.roleOther} required>
          <input id="roleOther" className="input max-w-sm" value={v.roleOther ?? ""} onChange={(e) => setV((s) => ({ ...s, roleOther: e.target.value }))} required />
        </Field>
      )}
      <div className="grid grid-cols-3 gap-4">
        {b.years.map((y) => (
          <Field key={y.key} id={y.key} label={y.label} required>
            <input id={y.key} type="number" min={0} max={60} step={0.5} className="input" value={v[y.key]} onChange={num(y.key)} required />
          </Field>
        ))}
      </div>
      <fieldset className="space-y-2">
        <legend className="label">{b.categoriesLegend} <span aria-hidden className="text-warn">*</span></legend>
        <p className="help">{b.selectAll}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {b.categories.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-accent" checked={v.categories.includes(c.value)} onChange={() => toggleCat(c.value)} />
              {c.label}
            </label>
          ))}
        </div>
        {v.categories.includes("other") && (
          <input aria-label={b.otherCategory} className="input max-w-sm" placeholder={b.otherCategory} value={v.categoriesOther ?? ""} onChange={(e) => setV((s) => ({ ...s, categoriesOther: e.target.value }))} required />
        )}
      </fieldset>
      <Field id="expertise" label={b.expertisePrompt} required>
        <TextArea id="expertise" rows={5} value={v.expertise} onChange={(txt) => setV((s) => ({ ...s, expertise: txt }))} required />
      </Field>
      {err && <Alert kind="error">{err}</Alert>}
      <button type="submit" className="btn-primary" disabled={busy}>{busy ? t.ui.saving : b.continue}</button>
    </form>
  );
}

// ---------------------------------------------------------------- introduction / tutorial continue
export function ContinueButton({ from, label, requireAck }: { from: "introduction" | "tutorial"; label: string; requireAck?: string }) {
  const t = useT();
  const [ack, setAck] = useState(false);
  const { busy, err, run } = useSubmit<void>(async () => {
    const r = await api<{ nextPath: string }>("/api/progress", { body: { from } });
    return r.nextPath;
  }, t.ui.somethingWrong);
  return (
    <div className="space-y-3">
      {requireAck && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-accent" checked={ack} onChange={(e) => setAck(e.target.checked)} />
          <span>{requireAck}</span>
        </label>
      )}
      {err && <Alert kind="error">{err}</Alert>}
      <button type="button" className="btn-primary" disabled={busy || (!!requireAck && !ack)} onClick={() => void run()}>{busy ? t.ui.saving : label}</button>
    </div>
  );
}

export const tutorialAckText = tutorialText.acknowledge;

// ---------------------------------------------------------------- final questionnaire
export function FinalForm({ initial }: { initial: Record<string, unknown> | null }) {
  const t = useT();
  const items = t.final.items;
  const [v, setV] = useState<Record<string, unknown>>(initial ?? {});
  const { busy, err, run } = useSubmit<Record<string, unknown>>(async (vals) => {
    const r = await api<{ nextPath: string }>("/api/final", { body: vals });
    return r.nextPath;
  }, t.ui.somethingWrong);
  const complete = items.every((it) => !it.required || (it.type === "likert7" ? typeof v[it.key] === "number" : String(v[it.key] ?? "").trim().length > 0));
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void run(v); }}>
      {items.map((it, i) =>
        it.type === "likert7" ? (
          <LikertScale key={it.key} title={`${i + 1}.`} prompt={it.prompt} name={it.key} value={typeof v[it.key] === "number" ? (v[it.key] as number) : null} onChange={(n) => setV((s) => ({ ...s, [it.key]: n }))} anchors={it.anchors ?? t.final.defaultAnchors} />
        ) : (
          <Field key={it.key} id={it.key} label={`${i + 1}. ${it.prompt}`} required={it.required}>
            {it.type === "textarea" ? <TextArea id={it.key} rows={4} value={String(v[it.key] ?? "")} onChange={(txt) => setV((s) => ({ ...s, [it.key]: txt }))} /> : <input id={it.key} className="input" value={String(v[it.key] ?? "")} onChange={(e) => setV((s) => ({ ...s, [it.key]: e.target.value }))} />}
          </Field>
        ),
      )}
      {err && <Alert kind="error">{err}</Alert>}
      <button type="submit" className="btn-primary" disabled={busy || !complete}>{busy ? t.ui.saving : t.final.submit}</button>
    </form>
  );
}
