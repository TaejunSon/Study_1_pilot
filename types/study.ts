/**
 * TypeScript types for all experiment data. Content/config lives in data/*.ts; these types only describe shapes.
 */

// ---------------------------------------------------------------- catalog
export const GESTURE_IDS = [
  "OPS_TAP", "OPS_DOUBLE_TAP", "OPS_SWIPE_UP", "OPS_SWIPE_DOWN", "OPS_SWIPE_LEFT", "OPS_SWIPE_RIGHT", "OPS_CIRCLE",
  "OC_TILT_UP", "OC_TILT_DOWN", "OC_TILT_LEFT", "OC_TILT_RIGHT", "OC_TAP", "OC_DOUBLE_TAP", "OC_CIRCLE",
] as const;
export type GestureId = (typeof GESTURE_IDS)[number];
export type GestureFamily = "OPS" | "OC";

export interface GestureDef {
  id: GestureId;
  family: GestureFamily;
  number: number;               // 1..14, fixed card order
  label: string;                // short participant-facing name
  description: string;          // one-sentence description shown on the card / tutorial
  demoAsset?: string;           // optional /gestures/<file>.gif|mp4|png|webm
}

export const COMMAND_IDS = ["NEXT_STEP", "PREVIOUS_STEP", "REPLAY_INSTRUCTION", "CONFIRM_DONE", "UNDO_CANCEL", "PAUSE_RESUME"] as const;
export type CommandId = (typeof COMMAND_IDS)[number];
export type BlockId = "NAV" | "CTRL";

export interface CommandDef {
  id: CommandId;
  blockId: BlockId;
  label: string;
  description: string;
  promptName: string;           // command name in the model's user text and map keys (next_step ...)
  sortOrder: number;
}

export interface CommandBlockDef {
  id: BlockId;
  label: string;
  commands: CommandId[];                       // order sent to the model
  opposites: [CommandId, CommandId] | null;    // the app's tag: which two commands are opposites
  sortOrder: number;
}

export type SceneId = string;
export interface SceneDef {
  id: SceneId;
  videoPath: string;            // /videos/<id>.mp4 (public)
  targetObject: string;         // participant-facing noun
  graspType?: string;           // base-task grasp type (admin/export only)
  description?: string;         // optional, not shown to participants unless studyConfig says so
  frameImage?: string;          // server path of the processed red-box frame sent to the model
  activeCommands: CommandId[];  // commands that form trials with this scene
  isPractice?: boolean;
  fixedRecommendation?: Partial<Record<CommandId, GestureId>>;   // fallback when no stored recommendation exists (practice)
}

// ---------------------------------------------------------------- flow
export const STAGES = ["consent", "background", "introduction", "tutorial", "practice", "trials", "final", "complete"] as const;
export type Stage = (typeof STAGES)[number];

export const TRIAL_PHASES = ["elicitation", "awaiting_recommendation", "evaluation", "reflection", "completed"] as const;
export type TrialPhase = (typeof TRIAL_PHASES)[number];

export const VERDICTS = ["accept_as_is", "usable_with_modification", "reject"] as const;
export type Verdict = (typeof VERDICTS)[number];

export type RecommendationSource = "stored" | "live_gpt" | "fixed";
export type RecommendationOrigin = "seed" | "precompute" | "admin_live" | "manual";
export type ProbingReason = "gesture_mismatch" | "low_rating" | "not_accepted";

export interface TrialPlanItem {
  order: number;                // 1-based
  sceneId: SceneId;
  commandId: CommandId;
  blockId: BlockId;
}

// ---------------------------------------------------------------- background questionnaire
export type ExpertiseCategory =
  | "gesture_interaction_design" | "gesture_elicitation" | "gesture_recognition" | "imu_interaction"
  | "vision_hand_interaction" | "xr_interaction" | "user_study_evaluation" | "other";

export interface BackgroundData {
  role: string;
  roleOther?: string;
  hciYears: number;
  xrYears: number;
  gestureYears: number;
  categories: ExpertiseCategory[];
  categoriesOther?: string;
  expertise: string;
}

// ---------------------------------------------------------------- database rows (snake_case as stored)
export interface ParticipantRow {
  id: string;
  stage: Stage;
  current_trial_index: number;
  consent_version: string | null;
  consent_given_at: string | null;
  background: BackgroundData | null;
  background_saved_at: string | null;
  randomization_seed: number | null;
  trial_order: TrialPlanItem[] | null;
  practice_completed_at: string | null;
  final_questionnaire: Record<string, unknown> | null;
  final_submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  last_seen_at: string;
  notes: string | null;
}

export interface TrialRow {
  id: string;
  participant_id: string;
  scene_id: SceneId;
  command_id: CommandId;
  block_id: BlockId | null;
  trial_order: number;
  is_practice: boolean;
  phase: TrialPhase;
  started_at: string | null;
  elicitation_locked_at: string | null;
  recommendation_revealed_at: string | null;
  evaluation_started_at: string | null;
  evaluation_submitted_at: string | null;
  reflection_started_at: string | null;
  completed_at: string | null;
  recommendation_source: RecommendationSource | null;
  system_gesture: GestureId | null;
  recommendation_id: string | null;
  override_id: string | null;
  gpt_call_log_id: string | null;
  recommendation_model: string | null;
  recommendation_prompt_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface ElicitationRow {
  trial_id: string;
  selected_gestures: GestureId[];
  best_gesture: GestureId | null;
  reason: string | null;
  excluded_gestures: GestureId[];
  exclusion_reason: string | null;
  locked: boolean;
  locked_at: string | null;
  updated_at: string;
}

export interface RatingsRow {
  trial_id: string;
  feasibility: number | null;
  task_compatibility: number | null;
  safety: number | null;
  semantic_compatibility: number | null;
  verdict: Verdict | null;
  submitted_at: string | null;
  updated_at: string;
}

export interface QualitativeRow {
  trial_id: string;
  system_reason: string | null;
  scene_evidence: string | null;
  contrast_reason: string | null;
  counterfactual: string | null;
  generalization: string | null;
  probing_triggered: boolean | null;
  probing_reasons: ProbingReason[] | null;
  submitted_at: string | null;
  updated_at: string;
}

export interface RecommendationRow {
  id: string;
  scene_id: SceneId;
  command_id: CommandId;
  gesture: GestureId;
  model: string;
  prompt_version: string;
  raw_response: unknown;
  parsed_response: unknown;
  origin: RecommendationOrigin;
  gpt_call_log_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OverrideRow {
  id: string;
  participant_id: string;
  scene_id: SceneId;
  command_id: CommandId;
  gesture: GestureId;
  model: string | null;
  prompt_version: string | null;
  gpt_call_log_id: string | null;
  active: boolean;
  created_at: string;
}

export interface GptCallLogRow {
  id: string;
  scene_id: SceneId;
  block_id: BlockId | null;
  commands: CommandId[];
  prompt_commands: string[];
  opposites: [CommandId, CommandId] | null;
  model: string;
  prompt_version: string;
  prompt_sha256: string | null;
  schema_sha256: string | null;
  image_path: string | null;
  request_user_text: string | null;
  status: "ok" | "error";
  error: string | null;
  raw_response: unknown;
  parsed_response: EnforcedResult | null;
  usage: unknown;
  latency_ms: number | null;
  triggered_by: string;
  created_at: string;
}

// ---------------------------------------------------------------- model output (contract v4) and code rules
export interface LadderStep { rule: string; why: string; keep: GestureId[] }
export interface ModelTarget {
  label: string;
  scene: { on: string; near: { L: string; R: string; U: string; D: string }; clr: number[]; state: string; act: string };
  grasp: string;
  free: string[];
  steps: LadderStep[];
  pair: GestureId[];
  map: Record<string, GestureId>;     // keyed by prompt command name
}
export interface ModelResponse { target: ModelTarget }

export interface EnforcedResult {
  final: GestureId[];                 // surviving set after rules A and C
  finalSize: number;
  backtrack: { from: string | null; finalSize: number; to: string; size: number } | null;
  pair: GestureId[] | null;
  map: GestureId[];                   // one gesture per command, in command order (rules B, C, D applied)
  mapByCommand: Record<string, GestureId>;   // keyed by command id
  rawMap: GestureId[];                // the model's own map in command order
  fixed: string[];                    // which rules changed something
  changed: boolean;
  trace: { rule: string; dropped: number[]; revived: number; stated: boolean }[];
}

// ---------------------------------------------------------------- API payloads
export interface RecommendationView {
  gesture: GestureId;
  source: RecommendationSource;
  model: string | null;
  promptVersion: string | null;
}

export interface ProbingState {
  triggered: boolean;            // Q13/Q14 shown
  reasons: ProbingReason[];
  gestureMismatch: boolean;      // best gesture != system gesture (Q12 is asked regardless; kept for analysis)
}

export interface TrialPayload {
  trial: TrialRow;
  scene: SceneDef;
  command: CommandDef;
  block: CommandBlockDef;
  elicitation: ElicitationRow | null;
  ratings: RatingsRow | null;
  qualitative: QualitativeRow | null;
  recommendation: RecommendationView | null;   // only present once the elicitation is locked
  probing: ProbingState | null;                // only present in the reflection phase
  index: number;                               // 1-based position for display
  total: number;
}
