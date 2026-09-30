import seed from "@/data/seed/recommendations.json";
import type { BlockId, CommandId, GestureId, RecommendationView, SceneDef } from "@/types/study";

/**
 * The stored recommendations. They are PRECOMPUTED — this build never calls a model, so no API key exists anywhere
 * in the site and the participant's machine talks to nothing but the static host.
 *
 * Each row is the modal map of k repeated runs of the adopted v4 contract for one scene and one command block
 * (base_setting: single red-boxed target, 5-rung ladder, code rules A-D). `scripts/build_seed.py` regenerates this
 * file from the base-task records; the full per-run evidence stays in provenance/ , which is committed but never
 * served, so a participant cannot read the ladder behind a recommendation.
 *
 * NOTE. Being a static build, this table ships inside the JavaScript bundle. The flow still reveals a gesture only
 * after Phase A is locked, but the values are present on the participant's machine from the first page load, so the
 * order is enforced by the interface rather than by the server withholding data. Run the study supervised.
 */
export interface SeedRow {
  scene_id: string;
  command_id: CommandId;
  block_id: BlockId;
  gesture: GestureId;
  model: string;
  prompt_version: string;
  /** how often the modal map won across the k runs (reported, never shown to participants) */
  modal_map_freq: number;
  k: number;
}

const rows = seed as SeedRow[];

const index = new Map<string, SeedRow>(rows.map((r) => [`${r.scene_id}::${r.command_id}`, r]));

export function storedRecommendation(sceneId: string, commandId: CommandId): SeedRow | null {
  return index.get(`${sceneId}::${commandId}`) ?? null;
}

/**
 * The recommendation a trial reveals after Phase A is locked. Stored rows first; the practice scene carries its own
 * fixed gesture because it was never part of the base-task set. Returns null when neither exists, which the trial
 * screen surfaces as "not available" instead of losing the participant's answers.
 */
export function resolveRecommendation(scene: SceneDef, commandId: CommandId): RecommendationView | null {
  const stored = storedRecommendation(scene.id, commandId);
  if (stored) return { gesture: stored.gesture, source: "stored", model: stored.model, promptVersion: stored.prompt_version };
  const fixed = scene.fixedRecommendation?.[commandId];
  if (fixed) return { gesture: fixed, source: "fixed", model: null, promptVersion: null };
  return null;
}

/** Which blocks the bundled seed can actually run (used to hide a block on the landing page if it is missing). */
export function blocksWithRecommendations(): BlockId[] {
  const byBlock = new Map<BlockId, Set<string>>();
  for (const r of rows) {
    if (!byBlock.has(r.block_id)) byBlock.set(r.block_id, new Set());
    byBlock.get(r.block_id)!.add(r.scene_id);
  }
  return [...byBlock.entries()].filter(([, scenes]) => scenes.size >= 18).map(([b]) => b);
}

export const seedRows = rows;
