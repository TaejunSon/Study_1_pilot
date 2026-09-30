"use client";
import {
  createDb, emptyElicitation, emptyQualitative, emptyRatings, loadCurrent, loadDb, logEvent, newTrial, nowIso,
  saveDb, setCurrentParticipantId, trialByOrder, type LocalDb,
} from "@/lib/local/state";
import { resolveRecommendation } from "@/lib/local/recommendations";
import { buildTrialPlan, seedForParticipant } from "@/lib/randomization";
import { pathForStage } from "@/lib/study/flow";
import { scenesForBlock } from "@/data/scenes";
import { practiceSceneForBlock } from "@/data/practice";
import { blockById, commandBlocks } from "@/data/commandBlocks";
import { commandById } from "@/data/commands";
import { studyConfig } from "@/data/studyConfig";
import { STUDY_SALT } from "@/data/studySettings";
import {
  backgroundSchema, consentSchema, elicitationLockSchema, finalSchema, participantIdSchema, progressSchema,
  ratingsSubmitSchema, reflectionSubmitSchema,
  type ElicitationDraft, type RatingsDraft, type ReflectionDraft,
} from "@/lib/validation/schemas";
import type {
  BackgroundData, BlockId, ElicitationRow, GestureId, ProbingReason, ProbingState, RatingsRow, SceneDef, Stage,
  TrialPayload, TrialRow,
} from "@/types/study";

/**
 * The study's state machine, running in the browser.
 *
 * This is a port of the server app's lib/study/trials.ts and its route handlers: the same stage order, the same
 * Phase A lock (once submitted, the elicitation can never be edited and only then is the recommendation revealed),
 * the same validation schemas. What changed is only where the rows live — localStorage instead of PostgreSQL.
 */
export class FlowError extends Error {
  constructor(message: string, public readonly redirect: string | null = null) {
    super(message);
    this.name = "FlowError";
  }
}

const NEXT_STAGE: Record<"introduction" | "tutorial" | "practice", Stage> = { introduction: "tutorial", tutorial: "practice", practice: "trials" };

// ---------------------------------------------------------------- session
export function currentDb(): LocalDb {
  const db = loadCurrent();
  if (!db) throw new FlowError("No study session in this browser. Start from the first page.", "/");
  return db;
}

export function scenesOf(db: LocalDb): SceneDef[] {
  return scenesForBlock(db.blockId);
}

function sceneOf(db: LocalDb, sceneId: string): SceneDef {
  if (sceneId === "practice_mug") return practiceSceneForBlock(db.blockId);
  const s = scenesOf(db).find((x) => x.id === sceneId);
  if (!s) throw new FlowError(`Scene ${sceneId} is not part of this study.`);
  return s;
}

/**
 * Start or resume a participant. Creating one fixes the randomization seed, the command block and the whole trial
 * order; resuming an existing ID reopens it exactly where it was left, including a different block.
 */
export function startParticipant(rawId: string, blockId: BlockId): { nextPath: string; resumed: boolean; blockId: BlockId } {
  const participantId = participantIdSchema.parse(rawId);
  const existing = loadDb(participantId);
  if (existing) {
    setCurrentParticipantId(participantId);
    saveDb(existing);
    return { nextPath: pathForStage(existing.participant), resumed: true, blockId: existing.blockId };
  }

  const seed = seedForParticipant(participantId, STUDY_SALT);
  const db = createDb(participantId, blockId, seed);
  const plan = buildTrialPlan(seed, scenesForBlock(blockId), commandBlocks.filter((b) => b.id === blockId));
  db.participant.trial_order = plan;
  db.trials = plan.map((it) => newTrial(participantId, it.order, it.sceneId, it.commandId, it.blockId, false));

  const practice = practiceSceneForBlock(blockId);
  const practiceCmd = practice.activeCommands[0];
  db.trials.unshift(newTrial(participantId, 0, practice.id, practiceCmd, blockId, true));

  logEvent(db, "participant_created", null, { blockId, seed, trials: plan.length });
  setCurrentParticipantId(participantId);
  saveDb(db);
  return { nextPath: pathForStage(db.participant), resumed: false, blockId };
}

function setStage(db: LocalDb, stage: Stage, patch: Partial<LocalDb["participant"]> = {}): string {
  db.participant = { ...db.participant, ...patch, stage };
  saveDb(db);
  return pathForStage(db.participant);
}

// ---------------------------------------------------------------- onboarding
export function submitConsent(db: LocalDb, body: unknown): { nextPath: string } {
  const data = consentSchema.parse(body);
  if (db.participant.stage !== "consent") throw new FlowError("Consent already recorded", pathForStage(db.participant));
  logEvent(db, "consent_given", null, { version: data.consentVersion });
  return { nextPath: setStage(db, "background", { consent_version: data.consentVersion, consent_given_at: nowIso() }) };
}

export function submitBackground(db: LocalDb, body: unknown): { nextPath: string } {
  const data = backgroundSchema.parse(body) as BackgroundData;
  if (db.participant.stage !== "background") throw new FlowError("Background already recorded", pathForStage(db.participant));
  return { nextPath: setStage(db, "introduction", { background: data, background_saved_at: nowIso() }) };
}

export function submitProgress(db: LocalDb, body: unknown): { nextPath: string } {
  const { from } = progressSchema.parse(body);
  if (db.participant.stage !== from) throw new FlowError(`Not in stage ${from}`, pathForStage(db.participant));
  return { nextPath: setStage(db, NEXT_STAGE[from]) };
}

export function submitFinal(db: LocalDb, body: unknown): { nextPath: string } {
  const data = finalSchema.parse(body);
  if (db.participant.stage !== "final") throw new FlowError("Final questionnaire is not open", pathForStage(db.participant));
  const at = nowIso();
  logEvent(db, "study_completed", null, {});
  return { nextPath: setStage(db, "complete", { final_questionnaire: data, final_submitted_at: at, completed_at: at }) };
}

// ---------------------------------------------------------------- trials
function loadTrial(db: LocalDb, order: number): TrialRow {
  const p = db.participant;
  if (p.stage === "practice" && order !== 0) throw new FlowError("Practice trial first", "/practice");
  if (p.stage === "trials" && order !== p.current_trial_index + 1) throw new FlowError("Not the current trial", `/trial/${p.current_trial_index + 1}`);
  if (p.stage !== "practice" && p.stage !== "trials") throw new FlowError("Not in a trial stage", pathForStage(p));
  const t = trialByOrder(db, order);
  if (!t) throw new FlowError(`Trial ${order} not found`);
  return t;
}

function patchTrial(db: LocalDb, trial: TrialRow, patch: Partial<TrialRow>): TrialRow {
  const i = db.trials.findIndex((t) => t.id === trial.id);
  const next = { ...db.trials[i], ...patch, updated_at: nowIso() };
  db.trials[i] = next;
  return next;
}

/** Analysis flags stored with every trial. They no longer change which questions are shown (decision 2026-09-23). */
export function computeProbing(elicitation: ElicitationRow | null, ratings: RatingsRow | null, systemGesture: GestureId | null): ProbingState {
  const reasons: ProbingReason[] = [];
  const best = elicitation?.best_gesture ?? null;
  const mismatch = !!best && !!systemGesture && best !== systemGesture;
  if (mismatch) reasons.push("gesture_mismatch");
  const th = studyConfig.probing.lowRatingThreshold;
  const vals = [ratings?.feasibility, ratings?.task_compatibility, ratings?.safety, ratings?.semantic_compatibility];
  if (vals.some((v) => typeof v === "number" && v <= th)) reasons.push("low_rating");
  if (ratings?.verdict && ratings.verdict !== "accept_as_is") reasons.push("not_accepted");
  return { triggered: reasons.length > 0, reasons, gestureMismatch: mismatch };
}

export function buildTrialPayload(db: LocalDb, trial: TrialRow): TrialPayload {
  const scene = sceneOf(db, trial.scene_id);
  const command = commandById[trial.command_id];
  const block = blockById[command.blockId];
  const elicitation = db.elicitation[trial.id] ?? null;
  const ratings = db.ratings[trial.id] ?? null;
  const qualitative = db.qualitative[trial.id] ?? null;
  const locked = !!elicitation?.locked;
  const recommendation = locked && trial.system_gesture
    ? { gesture: trial.system_gesture, source: trial.recommendation_source ?? "stored", model: trial.recommendation_model, promptVersion: trial.recommendation_prompt_version }
    : null;
  const probing = locked && (trial.phase === "reflection" || trial.phase === "completed") ? computeProbing(elicitation, ratings, trial.system_gesture) : null;
  const publicScene = studyConfig.showSceneDescriptionToParticipants ? scene : { ...scene, description: undefined, frameImage: undefined, fixedRecommendation: undefined };
  return {
    trial, scene: publicScene, command, block, elicitation, ratings, qualitative, recommendation, probing,
    index: trial.trial_order, total: (db.participant.trial_order ?? []).length,
  };
}

export function getTrial(db: LocalDb, order: number): TrialPayload {
  let trial = loadTrial(db, order);
  if (!trial.started_at) {
    trial = patchTrial(db, trial, { started_at: nowIso() });
    logEvent(db, "trial_started", trial.id, { order });
    saveDb(db);
  }
  return buildTrialPayload(db, trial);
}

// ---------------------------------------------------------------- phase A
export function saveElicitationDraft(db: LocalDb, order: number, draft: ElicitationDraft): void {
  const trial = loadTrial(db, order);
  const existing = db.elicitation[trial.id];
  if (existing?.locked || trial.phase !== "elicitation") throw new FlowError("Your answer for this trial is already submitted and cannot be changed.");
  db.elicitation[trial.id] = {
    ...(existing ?? emptyElicitation(trial.id)),
    selected_gestures: draft.selected, best_gesture: draft.best, reason: draft.reason,
    excluded_gestures: draft.excluded, exclusion_reason: draft.exclusionReason, updated_at: nowIso(),
  };
  saveDb(db);
}

/**
 * Submit Phase A: validate, LOCK, then reveal the stored recommendation. The order matters and is the point of the
 * design — the expert's own choice is fixed before the system's is shown. Idempotent: a second call on a locked
 * trial only retries the reveal.
 */
export function lockElicitation(db: LocalDb, order: number, draft: ElicitationDraft | null): TrialPayload {
  let trial = loadTrial(db, order);
  const existing = db.elicitation[trial.id] ?? null;
  if (!existing?.locked) {
    const data = elicitationLockSchema.parse(draft ?? {
      selected: existing?.selected_gestures ?? [], best: existing?.best_gesture ?? null, reason: existing?.reason ?? "",
      excluded: existing?.excluded_gestures ?? [], exclusionReason: existing?.exclusion_reason ?? "",
    });
    const at = nowIso();
    db.elicitation[trial.id] = {
      ...(existing ?? emptyElicitation(trial.id)),
      selected_gestures: data.selected, best_gesture: data.best, reason: data.reason,
      excluded_gestures: data.excluded, exclusion_reason: data.exclusionReason,
      locked: true, locked_at: at, updated_at: at,
    };
    trial = patchTrial(db, trial, { elicitation_locked_at: at, phase: "awaiting_recommendation" });
    logEvent(db, "elicitation_locked", trial.id, { best: data.best, n_selected: data.selected.length });
    saveDb(db);
  }
  return revealIfAvailable(db, trial.trial_order);
}

/** After the lock: attach the stored recommendation and move to Phase C. */
export function revealIfAvailable(db: LocalDb, order: number): TrialPayload {
  let trial = loadTrial(db, order);
  if (trial.phase !== "awaiting_recommendation") return buildTrialPayload(db, trial);
  const scene = sceneOf(db, trial.scene_id);
  const r = resolveRecommendation(scene, trial.command_id);
  if (!r) {
    logEvent(db, "recommendation_missing", trial.id, { scene: trial.scene_id, command: trial.command_id });
    saveDb(db);
    return buildTrialPayload(db, trial);
  }
  const at = nowIso();
  trial = patchTrial(db, trial, {
    phase: "evaluation", recommendation_revealed_at: at, evaluation_started_at: at,
    recommendation_source: r.source, system_gesture: r.gesture, recommendation_model: r.model, recommendation_prompt_version: r.promptVersion,
  });
  logEvent(db, "recommendation_revealed", trial.id, { gesture: r.gesture, source: r.source });
  saveDb(db);
  return buildTrialPayload(db, trial);
}

// ---------------------------------------------------------------- phase C
export function saveEvaluation(db: LocalDb, order: number, draft: RatingsDraft): TrialPayload {
  let trial = loadTrial(db, order);
  if (trial.phase !== "evaluation" && trial.phase !== "reflection") throw new FlowError("Ratings are not open in this phase");
  const { submit, ...vals } = draft;
  if (submit) ratingsSubmitSchema.parse(vals);
  const at = nowIso();
  db.ratings[trial.id] = { ...(db.ratings[trial.id] ?? emptyRatings(trial.id)), ...vals, submitted_at: submit ? at : db.ratings[trial.id]?.submitted_at ?? null, updated_at: at };
  if (submit && trial.phase === "evaluation") {
    trial = patchTrial(db, trial, { phase: "reflection", evaluation_submitted_at: at, reflection_started_at: at });
    logEvent(db, "evaluation_submitted", trial.id, { verdict: vals.verdict });
  } else if (submit) {
    trial = patchTrial(db, trial, { evaluation_submitted_at: at });
  }
  saveDb(db);
  return buildTrialPayload(db, trial);
}

/** Phase D -> Phase C: ratings stay editable until the trial is completed. */
export function backToEvaluation(db: LocalDb, order: number): TrialPayload {
  const trial = loadTrial(db, order);
  if (trial.phase !== "reflection") return buildTrialPayload(db, trial);
  const next = patchTrial(db, trial, { phase: "evaluation" });
  saveDb(db);
  return buildTrialPayload(db, next);
}

// ---------------------------------------------------------------- phase D
export function saveReflection(db: LocalDb, order: number, draft: ReflectionDraft): { nextPath: string } {
  let trial = loadTrial(db, order);
  if (trial.phase !== "reflection") throw new FlowError("Reflection is not open in this phase");
  const { submit, ...vals } = draft;
  const probing = computeProbing(db.elicitation[trial.id] ?? null, db.ratings[trial.id] ?? null, trial.system_gesture);
  if (submit) reflectionSubmitSchema.parse(vals);
  const at = nowIso();
  db.qualitative[trial.id] = {
    ...(db.qualitative[trial.id] ?? emptyQualitative(trial.id)), ...vals,
    probing_triggered: probing.triggered, probing_reasons: probing.reasons,
    submitted_at: submit ? at : db.qualitative[trial.id]?.submitted_at ?? null, updated_at: at,
  };
  if (!submit) { saveDb(db); return { nextPath: "" }; }

  trial = patchTrial(db, trial, { phase: "completed", completed_at: at });
  logEvent(db, "trial_completed", trial.id, { order: trial.trial_order, probing: probing.reasons });

  let nextPath: string;
  if (trial.is_practice) {
    nextPath = setStage(db, "trials", { practice_completed_at: at, current_trial_index: 0 });
    nextPath = "/trial/1";
  } else {
    const total = (db.participant.trial_order ?? []).length;
    const nextIndex = trial.trial_order;            // 0-based index of the next trial == this trial's 1-based order
    if (nextIndex >= total) {
      nextPath = setStage(db, "final", { current_trial_index: total });
    } else {
      db.participant = { ...db.participant, current_trial_index: nextIndex };
      nextPath = `/trial/${nextIndex + 1}`;
    }
  }
  saveDb(db);
  return { nextPath };
}
