import type { CommandBlockDef, SceneDef, TrialPlanItem } from "@/types/study";
import { studyConfig } from "@/data/studyConfig";

/** cyrb53-style string hash reduced to an unsigned 32-bit seed. */
export function hashToSeed(str: string): number {
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0) ^ (h1 >>> 0) >>> 0;
}

/** mulberry32: small, seedable, deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randomSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0];
}

export function seedForParticipant(participantId: string, salt: string): number {
  return studyConfig.randomization.seedFromParticipantId ? hashToSeed(`${salt}::${participantId}`) : randomSeed();
}

/**
 * Build the trial plan for one participant: the scenes are shuffled with the seeded PRNG; each scene expands
 * to one trial per active command (block order, then in-block order). With groupTrialsByBlock the trials of
 * each block form a contiguous group (scene order reshuffled per block), block order optionally alternating
 * by seed parity. The gesture card order is never touched here.
 */
export function buildTrialPlan(seed: number, sceneList: readonly SceneDef[], blocks: readonly CommandBlockDef[]): TrialPlanItem[] {
  const rng = mulberry32(seed);
  const cfg = studyConfig.trialDesign;
  let blockOrder = [...cfg.blockOrder];
  if (cfg.groupTrialsByBlock && cfg.counterbalanceBlockOrder && seed % 2 === 1) blockOrder = blockOrder.reverse();
  const blockRank = new Map(blockOrder.map((b, i) => [b, i]));
  const blockOf = (cmd: string) => blocks.find((b) => b.commands.includes(cmd as never));
  const cmdKey = (cmd: string) => {
    const b = blockOf(cmd);
    if (!b) throw new Error(`command ${cmd} belongs to no block`);
    return [blockRank.get(b.id) ?? 99, b.commands.indexOf(cmd as never)] as const;
  };
  const sortedCommands = (s: SceneDef) => s.activeCommands.slice().sort((x, y) => {
    const [bx, ix] = cmdKey(x), [by, iy] = cmdKey(y);
    return bx - by || ix - iy;
  });

  const items: Omit<TrialPlanItem, "order">[] = [];
  if (!cfg.groupTrialsByBlock) {
    for (const s of seededShuffle(sceneList, rng)) {
      for (const c of sortedCommands(s)) items.push({ sceneId: s.id, commandId: c, blockId: blockOf(c)!.id });
    }
  } else {
    for (const bId of blockOrder) {
      const inBlock = sceneList.filter((s) => s.activeCommands.some((c) => blockOf(c)?.id === bId));
      for (const s of seededShuffle(inBlock, rng)) {
        for (const c of sortedCommands(s)) if (blockOf(c)?.id === bId) items.push({ sceneId: s.id, commandId: c, blockId: bId });
      }
    }
  }
  return items.map((it, i) => ({ order: i + 1, ...it }));
}
