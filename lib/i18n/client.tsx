"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getDictionary } from "@/data/i18n";
import { LOCALES, DEFAULT_LOCALE, parseLocale, type Dictionary, type Locale } from "@/lib/i18n/types";

/**
 * Language state for the static build. The server app kept the locale in a cookie that server components read;
 * with no server, it is React state persisted in localStorage, so the toggle re-renders the tree directly instead
 * of asking the router to refresh.
 */
const STORAGE_KEY = "ees.pages.v1.locale";

const Ctx = createContext<{ locale: Locale; t: Dictionary; setLocale: (l: Locale) => void } | null>(null);

function readStored(): Locale {
  try {
    return parseLocale(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Mounted once in the root layout. The first render must match the pre-rendered HTML (always the default locale),
 * so a stored preference is applied in an effect right after hydration.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStored();
    if (stored !== DEFAULT_LOCALE) setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* private mode: the choice just will not persist */ }
  }, []);

  const value = useMemo(() => ({ locale, t: getDictionary(locale), setLocale }), [locale, setLocale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale(): Locale {
  return useContext(Ctx)?.locale ?? DEFAULT_LOCALE;
}

/** The participant-facing dictionary for the current locale. */
export function useT(): Dictionary {
  return useContext(Ctx)?.t ?? getDictionary(DEFAULT_LOCALE);
}

const LABEL: Record<Locale, string> = { en: "EN", ko: "KOR" };

/** EN / KOR switch. */
export function LocaleToggle({ className = "" }: { className?: string }) {
  const ctx = useContext(Ctx);
  const locale = ctx?.locale ?? DEFAULT_LOCALE;
  return (
    <span role="group" aria-label="Language / 언어" className={`inline-flex overflow-hidden rounded-md border border-line text-xs font-medium ${className}`}>
      {LOCALES.map((l) => (
        <button key={l} type="button" aria-pressed={locale === l} onClick={() => ctx?.setLocale(l)}
          className={`px-2.5 py-1 ${locale === l ? "bg-accent text-white" : "bg-white text-muted hover:bg-slate-50"}`}>
          {LABEL[l]}
        </button>
      ))}
    </span>
  );
}
