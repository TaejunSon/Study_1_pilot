import type { CommandDef, CommandId } from "@/types/study";

/** The 6 AR commands. `promptName` is the name the model sees (it must stay snake_case; the v4 contract keys its map by it). */
export const commands: CommandDef[] = [
  { id: "NEXT_STEP",          blockId: "NAV",  label: "Next step",          description: "Go to the next instruction step.",                 promptName: "next_step",          sortOrder: 1 },
  { id: "PREVIOUS_STEP",      blockId: "NAV",  label: "Previous step",      description: "Go back to the previous instruction step.",         promptName: "previous_step",      sortOrder: 2 },
  { id: "REPLAY_INSTRUCTION", blockId: "NAV",  label: "Replay instruction", description: "Play the current instruction again.",               promptName: "replay_instruction", sortOrder: 3 },
  { id: "CONFIRM_DONE",       blockId: "CTRL", label: "Confirm done",       description: "Confirm that the current step is finished.",         promptName: "confirm_done",       sortOrder: 4 },
  { id: "UNDO_CANCEL",        blockId: "CTRL", label: "Undo / cancel",      description: "Undo the last action or cancel the current one.",   promptName: "undo_cancel",        sortOrder: 5 },
  { id: "PAUSE_RESUME",       blockId: "CTRL", label: "Pause / resume",     description: "Pause or resume the instruction.",                  promptName: "pause_resume",       sortOrder: 6 },
];

export const commandById = Object.fromEntries(commands.map((c) => [c.id, c])) as Record<CommandId, CommandDef>;
