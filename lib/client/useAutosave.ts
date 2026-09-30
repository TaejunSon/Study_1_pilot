"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { studyConfig } from "@/data/studyConfig";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced autosave. `save` is called with the latest value after `delay` ms of inactivity, and retried after a
 * failure. `flush()` saves immediately (used before submit). Nothing is saved while `enabled` is false.
 */
export function useAutosave<T>(value: T, save: (v: T) => Promise<void>, opts: { enabled?: boolean; delay?: number } = {}) {
  const { enabled = true, delay = studyConfig.autosave.debounceMs } = opts;
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const lastSaved = useRef<string>(JSON.stringify(value));
  const latest = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef<Promise<void> | null>(null);
  latest.current = value;

  const doSave = useCallback(async () => {
    const v = latest.current;
    const key = JSON.stringify(v);
    if (key === lastSaved.current) { setStatus((s) => (s === "saving" ? "saved" : s)); return; }
    setStatus("saving");
    try {
      const p = save(v);
      inflight.current = p;
      await p;
      lastSaved.current = key;
      setStatus("saved");
      setError(null);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Save failed");
      timer.current = setTimeout(doSave, studyConfig.autosave.retryMs);
    } finally {
      inflight.current = null;
    }
  }, [save]);

  useEffect(() => {
    if (!enabled) return;
    if (JSON.stringify(value) === lastSaved.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(doSave, delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, enabled, delay, doSave]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    if (inflight.current) await inflight.current;
    await doSave();
    if (JSON.stringify(latest.current) !== lastSaved.current) throw new Error(error ?? "Could not save your answers");
  }, [doSave, error]);

  return { status, error, flush };
}
