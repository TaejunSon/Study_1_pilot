import type { GestureId } from "@/types/study";
import { hudMarks, HUD_SYMBOL_FONT } from "@/data/hudSymbols";

/**
 * The gesture's mark, exactly as the glasses HUD prints it.
 *
 * The HUD draws a symbol per recommended gesture, read from the catalog this component's table is generated from
 * (scripts/sync_hud_symbols.py). Showing anything else would mean an expert judges one depiction in the study and
 * meets a different one on the glasses, so the symbol is rendered as text rather than redrawn — a redrawing is
 * exactly the thing that drifts.
 *
 * Family is carried by colour, and on a card also by the "OPS n" / "OC n" badge beside it. Two gestures share the
 * symbol ◉ in the HUD catalog (OPS double tap and object tap); they are told apart by the name under the mark,
 * which is how the HUD distinguishes them too.
 */
export function GestureIcon({ id, className = "h-12 w-12" }: { id: GestureId; className?: string }) {
  const mark = hudMarks[id];
  const color = id.startsWith("OPS_") ? "#0f766e" : "#b45309";
  return (
    <span className={`inline-flex items-center justify-center ${className}`} aria-hidden>
      {/* the object double tap is two check marks on two lines, so the break in the catalog's symbol must survive */}
      <span style={{ color, fontFamily: HUD_SYMBOL_FONT, fontSize: "1.9rem", lineHeight: 0.82, whiteSpace: "pre-line", textAlign: "center", letterSpacing: "-0.03em" }}>
        {mark.symbol}
      </span>
    </span>
  );
}
