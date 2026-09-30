"use client";
import { toCsv } from "@/lib/export/csv";
import type { LocalDb } from "@/lib/local/state";
import { loadDb } from "@/lib/local/state";
import { studyConfig } from "@/data/studyConfig";
import { finalQuestionnaire } from "@/data/questionnaires";
import { sceneCatalog } from "@/data/scenes";
import { seedRows } from "@/lib/local/recommendations";
import { commandBlocks } from "@/data/commandBlocks";
import { commands } from "@/data/commands";
import { gestures } from "@/data/gestures";

/**
 * Exports. This build has no server to collect responses, so the export IS the collection step: one CSV per
 * participant holding everything they answered, plus a JSON with the untouched rows and the event log.
 *
 * The CSV is one row per trial with the participant's own columns repeated, so a file can be analysed on its own
 * and several files can simply be concatenated.
 */
const sceneById = Object.fromEntries(sceneCatalog.map((s) => [s.id, s]));

const seconds = (a: string | null, b: string | null): number | "" =>
  a && b ? Math.round((new Date(b).getTime() - new Date(a).getTime()) / 100) / 10 : "";

const FINAL_KEYS = finalQuestionnaire.map((i) => i.key);

export const CSV_COLUMNS = [
  // participant
  "participant_id", "block_id", "randomization_seed", "consent_version", "consent_given_at", "completed_at",
  "bg_role", "bg_role_other", "bg_hci_years", "bg_xr_years", "bg_gesture_years", "bg_categories", "bg_categories_other", "bg_expertise",
  ...FINAL_KEYS.map((k) => `final_${k}`),
  // trial
  "trial_order", "is_practice", "scene_id", "target_object", "grasp_type", "command_id",
  "selected_gestures", "n_selected", "best_gesture", "elicitation_reason", "excluded_gestures", "exclusion_reason",
  "system_gesture", "gesture_match", "system_in_selected", "recommendation_source", "recommendation_model", "recommendation_prompt_version", "recommendation_modal_map_freq",
  "feasibility", "task_compatibility", "safety", "semantic_compatibility", "verdict",
  "q10_system_reason", "q11_scene_evidence", "q12_contrast_reason", "q13_generalization",
  "probing_triggered", "probing_reasons",
  "trial_started_at", "elicitation_locked_at", "recommendation_revealed_at", "evaluation_submitted_at", "reflection_started_at", "trial_completed_at",
  "phase_a_seconds", "phase_c_seconds", "phase_d_seconds", "trial_seconds",
];

function rowsFor(db: LocalDb, includePractice: boolean): Record<string, unknown>[] {
  const p = db.participant;
  const bg = p.background;
  const fin = (p.final_questionnaire ?? {}) as Record<string, unknown>;
  const freq = new Map(seedRows.map((r) => [`${r.scene_id}::${r.command_id}`, r.modal_map_freq]));

  const base: Record<string, unknown> = {
    participant_id: p.id, block_id: db.blockId, randomization_seed: p.randomization_seed,
    consent_version: p.consent_version, consent_given_at: p.consent_given_at, completed_at: p.completed_at,
    bg_role: bg?.role ?? "", bg_role_other: bg?.roleOther ?? "", bg_hci_years: bg?.hciYears ?? "", bg_xr_years: bg?.xrYears ?? "",
    bg_gesture_years: bg?.gestureYears ?? "", bg_categories: bg?.categories ?? [], bg_categories_other: bg?.categoriesOther ?? "",
    bg_expertise: bg?.expertise ?? "",
    ...Object.fromEntries(FINAL_KEYS.map((k) => [`final_${k}`, fin[k] ?? ""])),
  };

  return db.trials
    .filter((t) => includePractice || !t.is_practice)
    .sort((a, b) => a.trial_order - b.trial_order)
    .map((t) => {
      const e = db.elicitation[t.id] ?? null;
      const r = db.ratings[t.id] ?? null;
      const q = db.qualitative[t.id] ?? null;
      const scene = sceneById[t.scene_id];
      return {
        ...base,
        trial_order: t.trial_order, is_practice: t.is_practice ? 1 : 0, scene_id: t.scene_id,
        target_object: scene?.targetObject ?? (t.scene_id === "practice_mug" ? "mug" : ""), grasp_type: scene?.graspType ?? "", command_id: t.command_id,
        selected_gestures: e?.selected_gestures ?? [], n_selected: e?.selected_gestures?.length ?? "",
        best_gesture: e?.best_gesture ?? "", elicitation_reason: e?.reason ?? "",
        excluded_gestures: e?.excluded_gestures ?? [], exclusion_reason: e?.exclusion_reason ?? "",
        system_gesture: t.system_gesture ?? "",
        gesture_match: e?.best_gesture && t.system_gesture ? (e.best_gesture === t.system_gesture ? 1 : 0) : "",
        system_in_selected: e?.selected_gestures && t.system_gesture ? (e.selected_gestures.includes(t.system_gesture) ? 1 : 0) : "",
        recommendation_source: t.recommendation_source ?? "", recommendation_model: t.recommendation_model ?? "",
        recommendation_prompt_version: t.recommendation_prompt_version ?? "",
        recommendation_modal_map_freq: freq.get(`${t.scene_id}::${t.command_id}`) ?? "",
        feasibility: r?.feasibility ?? "", task_compatibility: r?.task_compatibility ?? "", safety: r?.safety ?? "",
        semantic_compatibility: r?.semantic_compatibility ?? "", verdict: r?.verdict ?? "",
        q10_system_reason: q?.system_reason ?? "", q11_scene_evidence: q?.scene_evidence ?? "",
        q12_contrast_reason: q?.contrast_reason ?? "", q13_generalization: q?.generalization ?? "",
        probing_triggered: q?.probing_triggered === null || q?.probing_triggered === undefined ? "" : q.probing_triggered ? 1 : 0,
        probing_reasons: q?.probing_reasons ?? [],
        trial_started_at: t.started_at, elicitation_locked_at: t.elicitation_locked_at,
        recommendation_revealed_at: t.recommendation_revealed_at, evaluation_submitted_at: t.evaluation_submitted_at,
        reflection_started_at: t.reflection_started_at, trial_completed_at: t.completed_at,
        phase_a_seconds: seconds(t.started_at, t.elicitation_locked_at),
        phase_c_seconds: seconds(t.recommendation_revealed_at, t.evaluation_submitted_at),
        phase_d_seconds: seconds(t.reflection_started_at, t.completed_at),
        trial_seconds: seconds(t.started_at, t.completed_at),
      };
    });
}

export function participantCsv(db: LocalDb, includePractice = studyConfig.exports.includePractice): string {
  return toCsv(CSV_COLUMNS, rowsFor(db, includePractice));
}

/** Every participant stored in this browser, as one CSV (used by the experimenter page on a shared lab machine). */
export function combinedCsv(ids: string[], includePractice = studyConfig.exports.includePractice): string {
  const rows = ids.flatMap((id) => { const db = loadDb(id); return db ? rowsFor(db, includePractice) : []; });
  return toCsv(CSV_COLUMNS, rows);
}

/** The untouched rows plus the configuration snapshot, so a CSV column can always be traced back. */
export function participantJson(db: LocalDb): string {
  return JSON.stringify({
    exported_at: new Date().toISOString(),
    config: { studyConfig, blockId: db.blockId, scenes: sceneCatalog, commands, commandBlocks, gestures, recommendations: seedRows.filter((r) => r.block_id === db.blockId) },
    participant: db.participant,
    trials: db.trials,
    elicitation: Object.values(db.elicitation),
    ratings: Object.values(db.ratings),
    qualitative: Object.values(db.qualitative),
    events: db.events,
  }, null, 1);
}

/** Hand a string to the browser as a file download. */
export function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const csvName = (id: string) => `expert-study_${id}_${new Date().toISOString().slice(0, 10)}.csv`;
export const jsonName = (id: string) => `expert-study_${id}_${new Date().toISOString().slice(0, 10)}.json`;
