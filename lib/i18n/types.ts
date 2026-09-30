import type { BlockId, CommandId, ExpertiseCategory, GestureFamily, GestureId, Stage, TrialPhase, Verdict } from "@/types/study";

/**
 * Participant-facing language. The locale is a plain cookie (`ees_locale`, "en" | "ko") that the EN / KOR toggle sets;
 * server components read it with lib/i18n/server.ts, client components through the LocaleProvider (lib/i18n/client.tsx).
 * English stays the source of truth in data/*.ts; data/i18n/ko.ts mirrors it field by field (Dictionary keeps them in sync).
 * Gesture NAMES (the card labels such as "Tilt object up") are deliberately not translated; only their descriptions are.
 */
export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "ees_locale";
export const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseLocale(v: string | undefined | null): Locale {
  return v === "ko" ? "ko" : DEFAULT_LOCALE;
}

/** the four Phase D questions, asked in this order in every trial */
export type PhaseDKey = "q10" | "q11" | "q12" | "q13";

export interface LikertItem { key: "feasibility" | "task_compatibility" | "safety" | "semantic_compatibility"; title: string; prompt: string; anchors: [string, string] }
export interface FinalItemText { key: string; type: "likert7" | "text" | "textarea"; prompt: string; required?: boolean; anchors?: [string, string] }

export interface Dictionary {
  locale: Locale;
  languageName: string;
  studyName: string;
  landing: { subtitle: string; title: string; body: string[]; idLabel: string; idPlaceholder: string; start: string; starting: string; resumeBefore: string; resumeAfter: string; experimenterInterface: string };
  /** landing-page choice of the command block a participant runs (static build: both blocks are precomputed) */
  blockChoice: { legend: string; help: string; blockBody: Record<BlockId, string> };
  /** completion-page data export (static build: responses live in this browser until they are downloaded) */
  exportPanel: { title: string; body: string[]; downloadCsv: string; downloadJson: string; sendTo: string; downloaded: string; nothingToExport: string };
  consent: { title: string; sections: { heading: string; body: string }[]; checkbox: string; agree: string };
  introduction: { title: string; bullets: string[]; continue: string };
  tutorial: { title: string; body: string[]; acknowledge: string; continue: string };
  practice: { banner: string; done: string; continue: string };
  background: {
    title: string; intro: string; participantId: string; role: string; selectPlaceholder: string; roleOther: string; categoriesLegend: string; selectAll: string; otherCategory: string; continue: string;
    roles: { value: string; label: string }[];
    categories: { value: ExpertiseCategory; label: string }[];
    years: { key: "hciYears" | "xrYears" | "gestureYears"; label: string }[];
    expertisePrompt: string;
  };
  trial: {
    imagine: string; commandLabel: string; targetLabel: string; locked: string; awaiting: string; retry: string; checking: string; nextTrial: string; yourBest: string; systemGesture: string;
    replayVideo: string; videoAria: (target: string) => string; practiceTitle: string; trialTitle: (index: number, total: number) => string; progress: (done: number, total: number) => string;
    phaseLabel: Record<TrialPhase, string>;
    submittedReadonly: string; completed: string;
    chips: { system: string; best: string; selected: string; excluded: string };
    demonstration: (label: string) => string;
  };
  phaseA: {
    q1: string; q2: string; q2Help: string; q3: string; q4: string; q4Help: string; q4Why: string; submit: string;
    confirmTitle: string; confirmBody: string; confirmYes: string; confirmNo: string;
    selectInQ1First: string; completeRequired: string; submitting: string; summaryBefore: string; summaryAfter: (n: number) => string;
    errors: { selectAtLeastOne: string; chooseBest: string; giveReason: string; whyExcluded: string; couldNotSubmit: string };
  };
  phaseC: { intro: string; likert: LikertItem[]; verdictPrompt: string; verdicts: { value: Verdict; label: string }[]; submit: string; answerAll: string; couldNotContinue: string };
  phaseD: { title: string; titles: Record<PhaseDKey, string> } & Record<PhaseDKey, string> & { submit: string; backToRatings: string; answerAll: string; couldNotComplete: string };
  final: { title: string; body: string; submit: string; items: FinalItemText[]; defaultAnchors: [string, string] };
  completion: { title: string; body: string[]; participantId: string; completedAt: string };
  ui: { saving: string; saved: string; notSaved: (err: string) => string; retrying: string; loading: string; somethingWrong: string; couldNotCheck: string; couldNotGoBack: string };
  header: { participant: string; stages: Record<Stage, string> };
  errors: { noPractice: string; trialNotFound: (order: number) => string };
  families: Record<GestureFamily, { label: string; definition: string }>;
  gestures: Record<GestureId, { label: string; description: string }>;
  commands: Record<CommandId, { label: string; description: string }>;
  blocks: Record<BlockId, string>;
  /** participant-facing nouns for scene.targetObject; anything missing falls back to the English noun */
  objects: Record<string, string>;
}
