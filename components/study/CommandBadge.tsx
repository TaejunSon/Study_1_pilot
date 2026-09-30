"use client";
import type { CommandDef } from "@/types/study";
import { useT } from "@/lib/i18n/client";

/** The current AR command and the target object, always visible next to the video. */
export function CommandBadge({ command, targetObject }: { command: CommandDef; targetObject: string }) {
  const t = useT();
  const cmd = t.commands[command.id] ?? { label: command.label, description: command.description };
  return (
    <div className="card grid grid-cols-2 gap-4 p-4">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted">{t.trial.targetLabel}</div>
        <div className="mt-1 text-2xl font-semibold capitalize">{t.objects[targetObject] ?? targetObject}</div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted">{t.trial.commandLabel}</div>
        <div className="mt-1 text-2xl font-semibold text-accent">{cmd.label}</div>
        <div className="text-sm text-muted">{cmd.description}</div>
      </div>
    </div>
  );
}
