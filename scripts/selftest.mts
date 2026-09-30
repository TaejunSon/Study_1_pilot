/**
 * End-to-end self test: drives a participant through the whole study for BOTH command blocks and checks the
 * exports, without a browser.
 *
 * The study logic lives in lib/local/*, which only needs localStorage, so a stub is enough to run the real state
 * machine — the same code the published site runs. What this proves: the linear stage order, that Phase A locks
 * before any recommendation exists, that every one of the 18 trials resolves to a stored recommendation, that the
 * trial plan is a balanced permutation, and that the CSV has one row per trial with the answers in it.
 *
 *     npm run selftest
 */
import assert from "node:assert/strict";

// ---------------------------------------------------------------- localStorage stub (must exist before the imports below)
class MemoryStorage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
const storage = new MemoryStorage();
(globalThis as unknown as { window: unknown }).window = { localStorage: storage };
(globalThis as unknown as { localStorage: unknown }).localStorage = storage;

const {
  startParticipant, submitConsent, submitBackground, submitProgress, submitFinal,
  getTrial, saveElicitationDraft, lockElicitation, saveEvaluation, saveReflection, currentDb,
} = await import("@/lib/local/engine");
const { participantCsv, CSV_COLUMNS } = await import("@/lib/export/localExport");
const { storedRecommendation } = await import("@/lib/local/recommendations");
const { blockById } = await import("@/data/commandBlocks");
const { studyConfig } = await import("@/data/studyConfig");
import type { BlockId, GestureId } from "@/types/study";

const BACKGROUND = {
  role: "faculty", hciYears: 8, xrYears: 5, gestureYears: 4,
  categories: ["gesture_elicitation"], expertise: "Gesture elicitation and XR interaction studies.",
};
const FINAL: Record<string, unknown> = {};

function fillFinal() {
  // answer every required item of the final questionnaire in the shape its schema wants
  return import("@/data/questionnaires").then(({ finalQuestionnaire }) => {
    for (const it of finalQuestionnaire) {
      if (!it.required) continue;
      FINAL[it.key] = it.type === "likert7" ? 5 : "Self test answer.";
    }
  });
}

/** Run one trial (elicitation -> lock -> ratings -> reflection) and return the revealed gesture. */
function runTrial(order: number, pick: GestureId): { system: GestureId; nextPath: string } {
  const before = getTrial(currentDb(), order);
  assert.equal(before.trial.phase, "elicitation", `trial ${order} should start in elicitation`);
  assert.equal(before.recommendation, null, `trial ${order} must not expose a recommendation before the lock`);

  const draft = { selected: [pick], best: pick, reason: "Self test reason.", excluded: [] as GestureId[], exclusionReason: "" };
  saveElicitationDraft(currentDb(), order, draft);

  const locked = lockElicitation(currentDb(), order, draft);
  assert.ok(locked.elicitation?.locked, `trial ${order} elicitation should be locked`);
  assert.ok(locked.recommendation, `trial ${order} should reveal a recommendation after the lock`);
  assert.equal(locked.trial.phase, "evaluation");

  // once locked, the elicitation is immutable
  assert.throws(() => saveElicitationDraft(currentDb(), order, { ...draft, reason: "changed" }), /already submitted/i, `trial ${order} accepted an edit after the lock`);

  const afterC = saveEvaluation(currentDb(), order, {
    feasibility: 6, task_compatibility: 5, safety: 6, semantic_compatibility: 4, verdict: "accept_as_is", submit: true,
  });
  assert.equal(afterC.trial.phase, "reflection");

  const r = saveReflection(currentDb(), order, {
    system_reason: "Because the thumb is free on that surface.",
    scene_evidence: "The handle is held in a power grasp.",
    contrast_reason: "Mine was similar but used the other axis.",
    generalization: "It should hold for other handled objects.",
    submit: true,
  });
  return { system: locked.recommendation!.gesture, nextPath: r.nextPath };
}

async function runBlock(blockId: BlockId, participantId: string) {
  console.log(`\n=== ${blockId} block, participant ${participantId}`);
  const start = startParticipant(participantId, blockId);
  assert.equal(start.nextPath, "/consent");
  assert.equal(start.resumed, false);

  assert.equal(submitConsent(currentDb(), { agreed: true, consentVersion: studyConfig.consentVersion }).nextPath, "/background");
  assert.equal(submitBackground(currentDb(), BACKGROUND).nextPath, "/introduction");
  assert.equal(submitProgress(currentDb(), { from: "introduction" }).nextPath, "/tutorial");
  assert.equal(submitProgress(currentDb(), { from: "tutorial" }).nextPath, "/practice");

  // --- trial plan
  const plan = currentDb().participant.trial_order!;
  assert.equal(plan.length, 18, "expected 18 trials");
  assert.equal(new Set(plan.map((p) => p.sceneId)).size, 18, "every scene should appear exactly once");
  const perCommand = new Map<string, number>();
  for (const p of plan) perCommand.set(p.commandId, (perCommand.get(p.commandId) ?? 0) + 1);
  assert.deepEqual([...perCommand.values()].sort(), [6, 6, 6], `each command should appear 6 times, got ${[...perCommand]}`);
  assert.deepEqual(new Set([...perCommand.keys()]), new Set(blockById[blockId].commands), "the plan must use only this block's commands");

  // --- practice, then the 18 trials
  const practice = runTrial(0, "OPS_TAP");
  assert.equal(practice.nextPath, "/trial/1");

  let next = "/trial/1";
  for (let order = 1; order <= 18; order++) {
    assert.equal(next, `/trial/${order}`, `flow should arrive at trial ${order}`);
    const item = plan[order - 1];
    const expected = storedRecommendation(item.sceneId, item.commandId);
    assert.ok(expected, `no stored recommendation for ${item.sceneId} / ${item.commandId}`);
    const got = runTrial(order, order % 2 === 0 ? "OPS_TAP" : "OC_TILT_UP");
    assert.equal(got.system, expected!.gesture, `trial ${order} revealed ${got.system}, seed says ${expected!.gesture}`);
    next = got.nextPath;
  }
  assert.equal(next, "/final", "after 18 trials the flow should reach the final questionnaire");

  assert.equal(submitFinal(currentDb(), FINAL).nextPath, "/complete");
  const db = currentDb();
  assert.equal(db.participant.stage, "complete");
  assert.ok(db.participant.completed_at);

  // --- export
  const csv = participantCsv(db);
  const lines = csv.trimEnd().split("\r\n");
  const expectedRows = 18 + (studyConfig.exports.includePractice ? 1 : 0);
  assert.equal(lines.length, expectedRows + 1, `CSV should have ${expectedRows} rows plus a header, got ${lines.length - 1}`);
  assert.equal(lines[0], "﻿" + CSV_COLUMNS.join(","), "CSV header should be the declared column list");
  assert.ok(csv.includes("Because the thumb is free on that surface."), "CSV should carry the Phase D answers");
  assert.ok(csv.includes(participantId), "CSV should carry the participant ID");
  for (const g of plan.map((p) => storedRecommendation(p.sceneId, p.commandId)!.gesture)) {
    assert.ok(csv.includes(g), `CSV should carry the revealed gesture ${g}`);
  }
  console.log(`  18 trials + practice completed · CSV ${lines.length - 1} rows x ${CSV_COLUMNS.length} columns · ${csv.length} bytes`);
}

await fillFinal();
await runBlock("NAV", "SELFTEST_NAV");
await runBlock("CTRL", "SELFTEST_CTRL");

// resuming an existing participant must reopen it, not restart it
const resumed = startParticipant("SELFTEST_NAV", "CTRL");
assert.equal(resumed.resumed, true);
assert.equal(resumed.blockId, "NAV", "resuming must keep the participant's original block");
assert.equal(resumed.nextPath, "/complete");
console.log("\n=== resume keeps the original block and stage");

console.log("\nALL CHECKS PASSED");
