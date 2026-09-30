"use client";
import type {
  BlockId, ElicitationRow, ParticipantRow, QualitativeRow, RatingsRow, TrialRow,
} from "@/types/study";

/**
 * The whole study database for one participant, held in the browser.
 *
 * There is no server in this build: everything a participant answers is written to localStorage under their
 * participant ID and read back on the next page. That is what makes the study deployable as a static GitHub Pages
 * site, and it is also its main limitation — the data lives on that machine until it is exported as CSV, so the
 * completion page asks for the download and the experimenter page can re-export any participant stored here.
 */
export interface EventRow {
  at: string;
  type: string;
  trial_id: string | null;
  data: Record<string, unknown>;
}

export interface LocalDb {
  schemaVersion: 1;
  blockId: BlockId;
  participant: ParticipantRow;
  trials: TrialRow[];
  elicitation: Record<string, ElicitationRow>;
  ratings: Record<string, RatingsRow>;
  qualitative: Record<string, QualitativeRow>;
  events: EventRow[];
}

const NS = "ees.pages.v1";
const KEY_CURRENT = `${NS}.current`;
const KEY_IDS = `${NS}.ids`;
const keyFor = (id: string) => `${NS}.p.${id}`;

export const nowIso = () => new Date().toISOString();

export function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function store(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const s = window.localStorage;
    s.getItem(KEY_CURRENT);              // throws in a blocked/private context
    return s;
  } catch {
    return null;
  }
}

/** Thrown when the browser refuses localStorage: the study cannot run, and the participant must be told why. */
export class StorageUnavailableError extends Error {
  constructor() {
    super("This browser is blocking local storage, so your answers could not be saved. Turn off private browsing or allow site data for this page, then reload.");
    this.name = "StorageUnavailableError";
  }
}

function must(): Storage {
  const s = store();
  if (!s) throw new StorageUnavailableError();
  return s;
}

export function storageAvailable(): boolean {
  return store() !== null;
}

// ---------------------------------------------------------------- participant registry
export function listParticipantIds(): string[] {
  const s = store();
  if (!s) return [];
  try {
    const raw = s.getItem(KEY_IDS);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function rememberId(id: string): void {
  const s = must();
  const ids = listParticipantIds();
  if (!ids.includes(id)) s.setItem(KEY_IDS, JSON.stringify([...ids, id]));
}

export function currentParticipantId(): string | null {
  return store()?.getItem(KEY_CURRENT) ?? null;
}

export function setCurrentParticipantId(id: string | null): void {
  const s = must();
  if (id === null) s.removeItem(KEY_CURRENT);
  else s.setItem(KEY_CURRENT, id);
}

// ---------------------------------------------------------------- read / write
export function loadDb(id: string): LocalDb | null {
  const s = store();
  if (!s) return null;
  const raw = s.getItem(keyFor(id));
  if (!raw) return null;
  try {
    const db = JSON.parse(raw) as LocalDb;
    return db && db.schemaVersion === 1 ? db : null;
  } catch {
    return null;
  }
}

export function saveDb(db: LocalDb): void {
  const s = must();
  db.participant.last_seen_at = nowIso();
  try {
    s.setItem(keyFor(db.participant.id), JSON.stringify(db));
  } catch (e) {
    // QuotaExceededError: the only realistic cause is a very long set of free-text answers.
    throw new Error(`Could not save to this browser's storage (${e instanceof Error ? e.name : "unknown error"}). Export your data from the completion page before continuing.`);
  }
  rememberId(db.participant.id);
}

/** The participant this browser is currently running, or null. */
export function loadCurrent(): LocalDb | null {
  const id = currentParticipantId();
  return id ? loadDb(id) : null;
}

export function createDb(id: string, blockId: BlockId, seed: number): LocalDb {
  const at = nowIso();
  return {
    schemaVersion: 1,
    blockId,
    participant: {
      id,
      stage: "consent",
      current_trial_index: 0,
      consent_version: null,
      consent_given_at: null,
      background: null,
      background_saved_at: null,
      randomization_seed: seed,
      trial_order: null,
      practice_completed_at: null,
      final_questionnaire: null,
      final_submitted_at: null,
      completed_at: null,
      created_at: at,
      last_seen_at: at,
      notes: null,
    },
    trials: [],
    elicitation: {},
    ratings: {},
    qualitative: {},
    events: [],
  };
}

export function logEvent(db: LocalDb, type: string, trialId: string | null, data: Record<string, unknown> = {}): void {
  db.events.push({ at: nowIso(), type, trial_id: trialId, data });
}

// ---------------------------------------------------------------- row helpers
export function emptyElicitation(trialId: string): ElicitationRow {
  return { trial_id: trialId, selected_gestures: [], best_gesture: null, reason: "", excluded_gestures: [], exclusion_reason: "", locked: false, locked_at: null, updated_at: nowIso() };
}

export function emptyRatings(trialId: string): RatingsRow {
  return { trial_id: trialId, feasibility: null, task_compatibility: null, safety: null, semantic_compatibility: null, verdict: null, submitted_at: null, updated_at: nowIso() };
}

export function emptyQualitative(trialId: string): QualitativeRow {
  return { trial_id: trialId, system_reason: null, scene_evidence: null, contrast_reason: null, counterfactual: null, generalization: null, probing_triggered: null, probing_reasons: null, submitted_at: null, updated_at: nowIso() };
}

export function newTrial(participantId: string, order: number, sceneId: string, commandId: TrialRow["command_id"], blockId: BlockId, isPractice: boolean): TrialRow {
  const at = nowIso();
  return {
    id: newId(),
    participant_id: participantId,
    scene_id: sceneId,
    command_id: commandId,
    block_id: blockId,
    trial_order: order,
    is_practice: isPractice,
    phase: "elicitation",
    started_at: null,
    elicitation_locked_at: null,
    recommendation_revealed_at: null,
    evaluation_started_at: null,
    evaluation_submitted_at: null,
    reflection_started_at: null,
    completed_at: null,
    recommendation_source: null,
    system_gesture: null,
    recommendation_id: null,
    override_id: null,
    gpt_call_log_id: null,
    recommendation_model: null,
    recommendation_prompt_version: null,
    created_at: at,
    updated_at: at,
  };
}

export function trialByOrder(db: LocalDb, order: number): TrialRow | null {
  return db.trials.find((t) => t.trial_order === order) ?? null;
}

export function deleteParticipant(id: string): void {
  const s = must();
  s.removeItem(keyFor(id));
  s.setItem(KEY_IDS, JSON.stringify(listParticipantIds().filter((x) => x !== id)));
  if (currentParticipantId() === id) s.removeItem(KEY_CURRENT);
}
