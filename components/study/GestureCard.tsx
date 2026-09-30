"use client";
import type { GestureDef } from "@/types/study";
import { useT } from "@/lib/i18n/client";
import { GestureIcon } from "@/components/study/GestureIcon";

export type CardMode = "display" | "select" | "readonly";

function Demo({ g, label, demoAlt }: { g: GestureDef; label: string; demoAlt: string }) {
  if (!g.demoAsset) return <GestureIcon id={g.id} className="h-14 w-14" />;
  const isVideo = /\.(mp4|webm)$/i.test(g.demoAsset);
  return isVideo ? (
    <video src={g.demoAsset} className="h-20 w-full rounded object-cover" autoPlay loop muted playsInline aria-label={demoAlt} data-gesture={label} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={g.demoAsset} alt={demoAlt} className="h-20 w-full rounded object-cover" />
  );
}

/**
 * One gesture card. In "select" mode the whole card is a toggle button (aria-pressed); the visual state shows
 * selected / best / excluded / system. The card never changes position or size between states.
 * The gesture name (label) is the same in every language; only the description follows the locale.
 */
export function GestureCard({ g, mode, selected, best, excluded, system, onToggle, large = false }: {
  g: GestureDef; mode: CardMode; selected?: boolean; best?: boolean; excluded?: boolean; system?: boolean; onToggle?: () => void; large?: boolean;
}) {
  const t = useT();
  const text = t.gestures[g.id] ?? { label: g.label, description: g.description };
  const fam = g.family === "OPS" ? "chip-ops" : "chip-oc";
  const ring = system ? "ring-2 ring-accent border-accent" : best ? "ring-2 ring-ops border-ops" : selected ? "border-ops bg-ops-soft/40" : excluded ? "border-slate-300 bg-slate-100 opacity-80" : "border-line bg-white";
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className={fam}>{g.family} {g.number}</span>
        {system && <span className="chip border-accent/30 bg-accent-soft text-accent">{t.trial.chips.system}</span>}
        {!system && best && <span className="chip border-ops/30 bg-ops-soft text-ops">{t.trial.chips.best}</span>}
        {!system && !best && selected && <span className="chip border-ops/30 bg-white text-ops">{t.trial.chips.selected}</span>}
        {!system && excluded && <span className="chip border-slate-300 bg-white text-muted">{t.trial.chips.excluded}</span>}
      </div>
      <div className="my-2 flex justify-center"><Demo g={g} label={text.label} demoAlt={t.trial.demonstration(text.label)} /></div>
      <div className="text-sm font-semibold leading-tight">{text.label}</div>
      {(large || mode === "display") && <p className="mt-1 text-xs leading-snug text-muted">{text.description}</p>}
    </>
  );
  if (mode === "select") {
    return (
      <button type="button" onClick={onToggle} aria-pressed={!!selected} aria-label={`${text.label}: ${text.description}`} title={text.description}
        className={`flex h-full w-full flex-col rounded-lg border p-2.5 text-left hover:bg-slate-50 ${ring}`}>
        {body}
      </button>
    );
  }
  return <div className={`flex h-full w-full flex-col rounded-lg border p-2.5 ${ring}`} title={text.description}>{body}</div>;
}
