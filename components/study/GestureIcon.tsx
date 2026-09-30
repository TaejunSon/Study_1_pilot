import type { GestureId } from "@/types/study";

/**
 * Simple inline glyphs so the cards are scannable without demo assets. OPS = thumb-on-surface (filled dot / arrow
 * on a flat pad), OC = whole object (rounded rectangle) moving. Replace with demo assets via gestures.ts demoAsset.
 */
export function GestureIcon({ id, className = "h-12 w-12" }: { id: GestureId; className?: string }) {
  const ops = id.startsWith("OPS_");
  const stroke = ops ? "#0f766e" : "#b45309";
  const arrow = (dx: number, dy: number) => {
    const x1 = 32 - dx * 10, y1 = 32 - dy * 10, x2 = 32 + dx * 10, y2 = 32 + dy * 10;
    const hx = -dy, hy = dx;
    return (
      <g stroke={stroke} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
        <polyline points={`${x2 - dx * 6 + hx * 5},${y2 - dy * 6 + hy * 5} ${x2},${y2} ${x2 - dx * 6 - hx * 5},${y2 - dy * 6 - hy * 5}`} />
      </g>
    );
  };
  const kind = id.replace(/^(OPS|OC)_/, "");
  let inner: React.ReactNode;
  switch (kind) {
    case "TAP": inner = <circle cx={32} cy={32} r={6} fill={stroke} />; break;
    case "DOUBLE_TAP": inner = <><circle cx={25} cy={32} r={5} fill={stroke} /><circle cx={39} cy={32} r={5} fill={stroke} /></>; break;
    case "SWIPE_UP": case "TILT_UP": inner = arrow(0, -1); break;
    case "SWIPE_DOWN": case "TILT_DOWN": inner = arrow(0, 1); break;
    case "SWIPE_LEFT": case "TILT_LEFT": inner = arrow(-1, 0); break;
    case "SWIPE_RIGHT": case "TILT_RIGHT": inner = arrow(1, 0); break;
    case "CIRCLE": inner = (
      <g stroke={stroke} strokeWidth={3} fill="none" strokeLinecap="round">
        <path d="M 42 26 A 11 11 0 1 1 38 21" />
        <polyline points="35,17 39,21 35,25" />
      </g>
    ); break;
    default: inner = null;
  }
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      {ops ? (
        <rect x={10} y={10} width={44} height={44} rx={6} fill="#eef6f5" stroke="#9fd3cb" strokeWidth={1.5} />
      ) : (
        <rect x={14} y={8} width={36} height={48} rx={9} fill="#fbf3e6" stroke="#e5b87a" strokeWidth={1.5} strokeDasharray="4 3" />
      )}
      {inner}
    </svg>
  );
}
