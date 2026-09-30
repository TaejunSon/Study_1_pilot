import type { BlockId, CommandId, SceneDef } from "@/types/study";
import { videoUrl } from "@/data/studyMedia";

/**
 * The 18 base-task scenes (6 grasp types x 3 clips), in the fixed catalog order. Videos are loaded from the host
 * configured in data/studyMedia.ts; nothing about the clips lives in this repository except their ids.
 *
 * COMMAND ASSIGNMENT. A participant runs ONE command block (NAV or CTRL, chosen on the landing page) and sees all
 * 18 scenes, so each scene carries one command per block. Within every grasp type the block's three commands appear
 * exactly once, rotated by grasp type, so across the 18 trials each command appears 6 times and every grasp type is
 * seen with all three commands. The assignment is fixed data (identical for all participants); only the ORDER of
 * the scenes is randomized per participant.
 */
interface SceneSpec {
  id: string;
  targetObject: string;
  graspType: string;
  description: string;
}

const CATALOG: SceneSpec[] = [
  // cylindrical
  { id: "cylindrical_01_knife",              targetObject: "knife",             graspType: "cylindrical", description: "Kitchen counter; knife beside a cutting board." },
  { id: "cylindrical_02_dumbbell_hot3d",     targetObject: "dumbbell",          graspType: "cylindrical", description: "Desk; small dumbbell on a white sheet." },
  { id: "cylindrical_03_vacuum_handle_adl",  targetObject: "vacuum handle",     graspType: "cylindrical", description: "Living room; upright vacuum cleaner handle." },
  // spherical
  { id: "spherical_01_toy_0064127",          targetObject: "toy",               graspType: "spherical",   description: "Table with construction toys." },
  { id: "spherical_02_soccer_ball",          targetObject: "soccer ball",       graspType: "spherical",   description: "Ball held near the body." },
  { id: "spherical_03_tennis_ball_ego4d",    targetObject: "tennis ball",       graspType: "spherical",   description: "Dim court; tennis ball on the ground." },
  // palmar
  { id: "palmar_01_phone",                   targetObject: "phone",             graspType: "palmar",      description: "Desk with a laptop; phone lying flat." },
  { id: "palmar_02_baking_tray",             targetObject: "baking tray",       graspType: "palmar",      description: "Open oven; tray on the rack." },
  { id: "palmar_03_whiteboard_eraser_hot3d", targetObject: "whiteboard eraser", graspType: "palmar",      description: "Desk; eraser next to a marker and a mug." },
  // hook
  { id: "hook_01_bag",                       targetObject: "bag",               graspType: "hook",        description: "Outdoors; tote bag by the handles." },
  { id: "hook_02_pitcher_adl",               targetObject: "pitcher",           graspType: "hook",        description: "Kitchen counter; pitcher with a handle." },
  { id: "hook_03_bucket",                    targetObject: "bucket",            graspType: "hook",        description: "Yard; bucket with a wire handle." },
  // tip
  { id: "tip_01_screw",                      targetObject: "screw",             graspType: "tip",         description: "Tool drawer; small screw among tools." },
  { id: "tip_02_needle",                     targetObject: "needle",            graspType: "tip",         description: "Sewing; needle over white fabric." },
  { id: "tip_03_toothbrush_aea",             targetObject: "toothbrush",        graspType: "tip",         description: "Bathroom sink; toothbrush at the tap." },
  // lateral
  { id: "lateral_01_lighter_epic",           targetObject: "lighter",           graspType: "lateral",     description: "Kitchen; lighter next to the stove." },
  { id: "lateral_02_playing_cards_0059165",  targetObject: "playing cards",     graspType: "lateral",     description: "Table; cards laid out." },
  { id: "lateral_03_ruler",                  targetObject: "ruler",             graspType: "lateral",     description: "Workshop floor; ruler on a board." },
];

if (CATALOG.length !== 18) throw new Error(`expected 18 scenes, got ${CATALOG.length}`);

/** Commands of each block, in the order used for the rotation below (the same order the model saw). */
const BLOCK_COMMANDS: Record<BlockId, CommandId[]> = {
  NAV: ["NEXT_STEP", "PREVIOUS_STEP", "REPLAY_INSTRUCTION"],
  CTRL: ["CONFIRM_DONE", "UNDO_CANCEL", "PAUSE_RESUME"],
};

const GRASP_ORDER = ["cylindrical", "spherical", "palmar", "hook", "tip", "lateral"];

/** The Latin square: scene i of grasp type g takes command (i + g) mod 3 of the block. */
export function commandForScene(sceneId: string, blockId: BlockId): CommandId {
  const idx = CATALOG.findIndex((s) => s.id === sceneId);
  if (idx < 0) throw new Error(`unknown scene ${sceneId}`);
  const g = GRASP_ORDER.indexOf(CATALOG[idx].graspType);
  const withinGrasp = idx % 3;
  return BLOCK_COMMANDS[blockId][(withinGrasp + g) % 3];
}

const toScene = (spec: SceneSpec, blockId: BlockId): SceneDef => ({
  id: spec.id,
  videoPath: videoUrl(spec.id),
  targetObject: spec.targetObject,
  graspType: spec.graspType,
  description: spec.description,
  activeCommands: [commandForScene(spec.id, blockId)],
});

/** The 18 scenes as they are used by a participant running `blockId`. */
export function scenesForBlock(blockId: BlockId): SceneDef[] {
  return CATALOG.map((s) => toScene(s, blockId));
}

/** Catalog order, block-independent (used where only ids, objects and grasp types matter, e.g. exports). */
export const sceneCatalog = CATALOG;
export const sceneIds = CATALOG.map((s) => s.id);

/** Default export shape kept for the pieces copied verbatim from the server app. */
export const scenes: SceneDef[] = scenesForBlock("NAV");
export const sceneById = Object.fromEntries(CATALOG.map((s) => [s.id, toScene(s, "NAV")])) as Record<string, SceneDef>;
