"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import type { SaveStatus } from "@/lib/client/useAutosave";
import { useT } from "@/lib/i18n/client";

// ---------------------------------------------------------------- layout primitives
export function Card({ children, className = "", title, aside }: { children: ReactNode; className?: string; title?: ReactNode; aside?: ReactNode }) {
  return (
    <section className={`card p-5 ${className}`}>
      {(title || aside) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function Alert({ kind = "info", children }: { kind?: "info" | "warn" | "error" | "success"; children: ReactNode }) {
  const cls = { info: "border-blue-200 bg-blue-50 text-blue-900", warn: "border-amber-200 bg-amber-50 text-amber-900", error: "border-red-200 bg-red-50 text-red-900", success: "border-green-200 bg-green-50 text-green-900" }[kind];
  return <div role={kind === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}

export function Spinner({ label }: { label?: string }) {
  const t = useT();
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2 text-sm text-muted">
      <span aria-hidden className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-accent" />
      {label ?? t.ui.loading}
    </span>
  );
}

export function SaveIndicator({ status, error }: { status: SaveStatus; error: string | null }) {
  const t = useT();
  const text = status === "saving" ? t.ui.saving : status === "saved" ? t.ui.saved : status === "error" ? t.ui.notSaved(error ?? t.ui.retrying) : "";
  return <span aria-live="polite" className={`text-xs ${status === "error" ? "text-warn" : "text-muted"}`}>{text}</span>;
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap text-sm text-muted">{label}</span>
      <div className="h-2 w-40 overflow-hidden rounded bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- form primitives
export function Field({ label, help, error, children, required, id }: { label: ReactNode; help?: ReactNode; error?: string | null; children: ReactNode; required?: boolean; id?: string }) {
  const autoId = useId();
  const fid = id ?? autoId;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fid} className="label">
        {label} {required && <span aria-hidden className="text-warn">*</span>}
      </label>
      {help && <p className="help">{help}</p>}
      <div data-field-id={fid}>{children}</div>
      {error && <p role="alert" className="text-sm text-warn">{error}</p>}
    </div>
  );
}

export function RadioGroup<T extends string>({ legend, help, name, value, onChange, options, disabled, inline = false }: {
  legend: ReactNode; help?: ReactNode; name: string; value: T | null; onChange: (v: T) => void; options: { value: T; label: string; description?: string }[]; disabled?: boolean; inline?: boolean;
}) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="label">{legend}</legend>
      {help && <p className="help">{help}</p>}
      <div className={inline ? "flex flex-wrap gap-x-5 gap-y-2" : "space-y-1.5"}>
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-start gap-2 text-sm">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="mt-0.5 h-4 w-4 accent-accent" />
            <span>
              {o.label}
              {o.description && <span className="block text-xs text-muted">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** 7-point scale, all options always visible on one row; anchors at both ends; keyboard arrows move between points. */
export function LikertScale({ title, prompt, name, value, onChange, anchors, min = 1, max = 7, disabled }: {
  title: string; prompt: string; name: string; value: number | null; onChange: (v: number) => void; anchors: [string, string]; min?: number; max?: number; disabled?: boolean;
}) {
  const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <fieldset className="rounded-md border border-line p-3" disabled={disabled}>
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      <p className="mb-2 text-sm">{prompt}</p>
      <div className="flex items-center gap-2">
        <span className="w-28 shrink-0 text-right text-xs text-muted">{min} = {anchors[0]}</span>
        <div className="flex flex-1 justify-between">
          {points.map((p) => (
            <label key={p} className={`flex w-10 cursor-pointer flex-col items-center gap-1 rounded-md py-1 text-xs ${value === p ? "bg-accent-soft font-semibold" : "hover:bg-slate-100"}`}>
              <input type="radio" name={name} value={p} checked={value === p} onChange={() => onChange(p)} className="h-4 w-4 accent-accent" aria-label={`${title}: ${p}`} />
              <span aria-hidden>{p}</span>
            </label>
          ))}
        </div>
        <span className="w-28 shrink-0 text-xs text-muted">{max} = {anchors[1]}</span>
      </div>
    </fieldset>
  );
}

export function TextArea({ id, value, onChange, disabled, rows = 4, placeholder, required }: { id?: string; value: string; onChange: (v: string) => void; disabled?: boolean; rows?: number; placeholder?: string; required?: boolean }) {
  return <textarea id={id} className="textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} aria-required={required} />;
}

// ---------------------------------------------------------------- modal
export function Modal({ open, title, children, onClose, actions }: { open: boolean; title: string; children: ReactNode; onClose: () => void; actions: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button, [href], input, textarea")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
        <div className="mt-3 text-sm text-ink">{children}</div>
        <div className="mt-5 flex justify-end gap-2">{actions}</div>
      </div>
    </div>
  );
}
