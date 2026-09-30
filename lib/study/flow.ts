import { STAGES, type Stage } from "@/types/study";

/** Participant stage machine: the stored stage decides the only page a participant may be on. */
export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}

export function nextStage(stage: Stage): Stage {
  const i = stageIndex(stage);
  return STAGES[Math.min(i + 1, STAGES.length - 1)];
}

export function pathForStage(p: { stage: Stage; current_trial_index: number }): string {
  switch (p.stage) {
    case "consent": return "/consent";
    case "background": return "/background";
    case "introduction": return "/introduction";
    case "tutorial": return "/tutorial";
    case "practice": return "/practice";
    case "trials": return `/trial/${p.current_trial_index + 1}`;
    case "final": return "/final";
    case "complete": return "/complete";
  }
}

/** Human-readable progress for the header. */
export function stageLabel(stage: Stage): string {
  return { consent: "Consent", background: "Background", introduction: "Introduction", tutorial: "Gesture catalog", practice: "Practice", trials: "Trials", final: "Final questionnaire", complete: "Complete" }[stage];
}
