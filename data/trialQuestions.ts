import type { Verdict } from "@/types/study";

/**
 * All trial question wording (Phase A, C, D), kept out of the UI components.
 * Phase C/D wording is only ever rendered after the elicitation is locked.
 */
export const phaseA = {
  q1: "Select all gestures that you think would be appropriate for executing this command while naturally holding the object with one hand.",
  q2: "Which one is the most appropriate gesture?",
  q2Help: "Choose from the gestures you selected above.",
  q3: "What was the most important reason for your selection? Please also describe any information in the current scene that influenced your judgment.",
  q4: "Was there a gesture you considered but eventually excluded?",
  q4Help: "Optional. Select any gestures that you considered and then decided against.",
  q4Why: "Why did you exclude it?",
  submit: "Submit elicitation",
  confirmTitle: "Submit your selection?",
  confirmBody: "After submission, the system recommendation will be revealed and your elicitation response can no longer be modified.",
  confirmYes: "Submit and reveal recommendation",
  confirmNo: "Go back",
};

export interface LikertQuestion { key: "feasibility" | "task_compatibility" | "safety" | "semantic_compatibility"; title: string; prompt: string; anchors: [string, string] }

export const phaseC = {
  intro: "The system recommended the gesture shown below for this command. Please rate the recommendation.",
  likert: [
    { key: "feasibility", title: "Physical feasibility & grasp preservation",
      prompt: "Do you think the recommended gesture can be performed while maintaining a natural one-handed grasp of the object?",
      anchors: ["strongly disagree", "strongly agree"] },
    { key: "task_compatibility", title: "Task compatibility",
      prompt: "Do you think the recommended gesture is unlikely to interfere with or be confused with the natural task motion used with this object?",
      anchors: ["strongly disagree", "strongly agree"] },
    { key: "safety", title: "Safety",
      prompt: "Considering the state of the object and the surrounding environment, do you think the recommended gesture can be performed safely?",
      anchors: ["very unsafe", "very safe"] },
    { key: "semantic_compatibility", title: "Semantic compatibility",
      prompt: "Do you think the recommended gesture intuitively matches the meaning of the current AR command?",
      anchors: ["not at all", "very well"] },
  ] as LikertQuestion[],
  verdictPrompt: "Overall, how would you judge the system recommendation?",
  verdicts: [
    { value: "accept_as_is", label: "Accept as-is" },
    { value: "usable_with_modification", label: "Usable with modification" },
    { value: "reject", label: "Difficult to use / Reject" },
  ] as { value: Verdict; label: string }[],
  submit: "Continue",
};

export const phaseD = {
  /** short titles shown above each question (analysis codes: recommendation reasoning / scene cue / agreement-disagreement reasoning / generalization) */
  titles: { q10: "Recommendation rationale", q11: "Scene evidence", q12: "Human-system comparison", q13: "Generalization" },
  q10: "What is the most important reason for the way you rated the system recommendation?",
  q11: "Which information in the current scene had the greatest influence on that judgment?",
  // asked of everyone, neutral: it must not presuppose agreement or disagreement
  q12: "Comparing the gesture you first chose with the gesture the system recommended, how do you see the relationship between the two choices? Please explain your reasoning.",
  // the counterfactual question ("which condition would have to change") was dropped on 2026-09-23
  q13: "Do you think the judgment criterion you described above could also apply to other objects or scenes? If so, in which situations could it apply, and are there exceptions where it would not?",
  submit: "Complete this trial",
};
