import type { BlockId, CommandBlockDef, CommandId } from "@/types/study";

/**
 * Command blocks, configured separately from scenes.
 *  - `commands`  is the command set sent to the model in ONE call (the v4 contract maps a 3-command set at once).
 *  - `opposites` is the app-side tag telling the model which two commands are opposites (v4 user text
 *    "Opposite commands: a / b"); code rule B then guarantees they get a surviving opposing gesture pair.
 * Trial grouping/order by block is controlled in studyConfig.trialDesign.
 */
export const commandBlocks: CommandBlockDef[] = [
  { id: "NAV",  label: "Navigation", commands: ["NEXT_STEP", "PREVIOUS_STEP", "REPLAY_INSTRUCTION"], opposites: ["NEXT_STEP", "PREVIOUS_STEP"], sortOrder: 1 },
  { id: "CTRL", label: "Control",    commands: ["CONFIRM_DONE", "UNDO_CANCEL", "PAUSE_RESUME"],      opposites: ["CONFIRM_DONE", "UNDO_CANCEL"], sortOrder: 2 },
];

export const blockById = Object.fromEntries(commandBlocks.map((b) => [b.id, b])) as Record<BlockId, CommandBlockDef>;

export function blockOfCommand(commandId: CommandId): CommandBlockDef {
  const b = commandBlocks.find((blk) => blk.commands.includes(commandId));
  if (!b) throw new Error(`command ${commandId} belongs to no block`);
  return b;
}
