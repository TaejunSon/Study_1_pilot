"use client";
import { gestures } from "@/data/gestures";
import type { GestureId } from "@/types/study";
import { useT } from "@/lib/i18n/client";
import { GestureCard, type CardMode } from "@/components/study/GestureCard";

/** The 14 cards in their FIXED order: one row per family (OPS 1-7, OC 8-14). Never reordered or shuffled. */
export function GestureGrid({ mode, selected = [], best = null, excluded = [], system = null, onToggle, large = false, showFamilyHeaders = true }: {
  mode: CardMode; selected?: GestureId[]; best?: GestureId | null; excluded?: GestureId[]; system?: GestureId | null; onToggle?: (id: GestureId) => void; large?: boolean; showFamilyHeaders?: boolean;
}) {
  const t = useT();
  const families: ("OPS" | "OC")[] = ["OPS", "OC"];
  return (
    <div className="space-y-4">
      {families.map((fam) => (
        <div key={fam}>
          {showFamilyHeaders && (
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
              <span className={fam === "OPS" ? "chip-ops" : "chip-oc"}>{t.families[fam].label}</span>
              <span className="text-xs text-muted">{t.families[fam].definition}</span>
            </div>
          )}
          <ul className="grid grid-cols-7 gap-2" aria-label={`${fam} gestures`}>
            {gestures.filter((g) => g.family === fam).map((g) => (
              <li key={g.id}>
                <GestureCard g={g} mode={mode} large={large} selected={selected.includes(g.id)} best={best === g.id} excluded={excluded.includes(g.id)} system={system === g.id} onToggle={onToggle ? () => onToggle(g.id) : undefined} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
