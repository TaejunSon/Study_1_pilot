import type { Dictionary, Locale } from "@/lib/i18n/types";
import { en } from "@/data/i18n/en";
import { ko } from "@/data/i18n/ko";

export const dictionaries: Record<Locale, Dictionary> = { en, ko };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}
