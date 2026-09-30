import type { BlockId, CommandId, GestureId, SceneDef } from "@/types/study";
import { videoUrl } from "@/data/studyMedia";

/**
 * Practice trial. Uses a clip that is NOT one of the 18 study scenes. The practice trial runs the full
 * A -> recommendation -> C -> D flow so participants see every screen once; its responses are marked
 * is_practice and are excluded from the exports by default.
 *
 * The practice recommendation is fixed here rather than taken from the precomputed store: the practice clip was
 * never part of the base-task set, so no model result exists for it.
 */
const PRACTICE_COMMAND: Record<BlockId, CommandId> = { NAV: "NEXT_STEP", CTRL: "CONFIRM_DONE" };
const PRACTICE_GESTURE: Record<BlockId, GestureId> = { NAV: "OPS_SWIPE_UP", CTRL: "OPS_TAP" };

export function practiceSceneForBlock(blockId: BlockId): SceneDef {
  const command = PRACTICE_COMMAND[blockId];
  return {
    id: "practice_mug",
    videoPath: videoUrl("practice_mug"),
    targetObject: "mug",
    graspType: "hook",
    description: "Practice: mug on a table.",
    activeCommands: [command],
    isPractice: true,
    fixedRecommendation: { [command]: PRACTICE_GESTURE[blockId] } as Partial<Record<CommandId, GestureId>>,
  };
}

export const practiceScene: SceneDef = practiceSceneForBlock("NAV");
