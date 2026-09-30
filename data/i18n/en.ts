/**
 * English dictionary = the existing content modules (data/text.ts, trialQuestions.ts, questionnaires.ts, gestures.ts,
 * commands.ts) plus the short UI strings that used to live inline in components. data/*.ts stays the source of truth;
 * this file only assembles it into the Dictionary shape that data/i18n/ko.ts mirrors.
 */
import { landingText, consentText, introductionText, tutorialText, practiceText, trialText, finalText, completionText } from "@/data/text";
import { phaseA, phaseC, phaseD } from "@/data/trialQuestions";
import { backgroundQuestionnaire, finalQuestionnaire } from "@/data/questionnaires";
import { gestures, GESTURE_FAMILIES } from "@/data/gestures";
import { commands } from "@/data/commands";
import { commandBlocks } from "@/data/commandBlocks";
import { studyConfig } from "@/data/studyConfig";
import type { Dictionary } from "@/lib/i18n/types";

export const en: Dictionary = {
  locale: "en",
  languageName: "English",
  studyName: studyConfig.studyName,
  landing: {
    ...landingText,
    starting: "Starting…",
    resumeBefore: "A session for ",
    resumeAfter: " exists in this browser. Press start to resume it.",
    experimenterInterface: "Experimenter interface",
  },
  blockChoice: {
    legend: "Command set for this session",
    help: "Your experimenter will tell you which one to run. All 18 situations are shown either way; only the three AR commands differ.",
    blockBody: {
      NAV: "Move through the instructions: next step, previous step, replay instruction.",
      CTRL: "Control the current step: confirm done, undo / cancel, pause / resume.",
    },
  },
  exportPanel: {
    title: "Save your responses",
    body: [
      "Your answers were stored in this browser only. Download them now and send the file to the experimenter — nothing is transmitted automatically.",
      "Keep this page open until the file is saved. Clearing the browser's site data removes the responses.",
    ],
    downloadCsv: "Download responses (CSV)",
    downloadJson: "Download full record (JSON)",
    sendTo: "Send the file to",
    downloaded: "Downloaded. Thank you — you can close this page once the file has been sent.",
    nothingToExport: "No responses found in this browser.",
  },
  consent: consentText,
  introduction: introductionText,
  tutorial: tutorialText,
  practice: practiceText,
  background: {
    title: "Background",
    intro: "A few questions about your experience.",
    participantId: "Participant ID",
    role: "Role",
    selectPlaceholder: "Select…",
    roleOther: "Please specify your role",
    categoriesLegend: "Gesture-related experience categories",
    selectAll: "Select all that apply.",
    otherCategory: "Other category",
    continue: "Continue",
    roles: backgroundQuestionnaire.roles,
    categories: backgroundQuestionnaire.categories,
    years: [...backgroundQuestionnaire.years],
    expertisePrompt: backgroundQuestionnaire.expertisePrompt,
  },
  trial: {
    imagine: trialText.imagine,
    commandLabel: trialText.commandLabel,
    targetLabel: trialText.targetLabel,
    locked: trialText.locked,
    awaiting: trialText.awaiting,
    retry: trialText.retry,
    checking: "Checking",
    nextTrial: trialText.nextTrial,
    yourBest: trialText.yourBest,
    systemGesture: trialText.systemGesture,
    replayVideo: "Replay video",
    videoAria: (target) => `Scene video, target object: ${target}`,
    practiceTitle: "Practice trial",
    trialTitle: (index, total) => `Trial ${index} of ${total}`,
    progress: (done, total) => `${done} of ${total} completed`,
    phaseLabel: { elicitation: "Your selection", awaiting_recommendation: "Your selection (submitted)", evaluation: "System recommendation", reflection: "Your reflection", completed: "Completed" },
    submittedReadonly: "Your submitted selection (read-only)",
    completed: "Trial completed.",
    chips: { system: "system", best: "best", selected: "selected", excluded: "excluded" },
    demonstration: (label) => `${label} demonstration`,
  },
  phaseA: {
    ...phaseA,
    selectInQ1First: "Select gestures in Q1 first.",
    completeRequired: "Please complete the required parts above.",
    submitting: "Submitting…",
    summaryBefore: "Your most appropriate gesture: ",
    summaryAfter: (n) => ` (${n} selected).`,
    errors: {
      selectAtLeastOne: "Select at least one gesture.",
      chooseBest: "Choose the most appropriate gesture from your selection.",
      giveReason: "Please give your reason.",
      whyExcluded: "Please say why you excluded these gestures.",
      couldNotSubmit: "Could not submit. Please try again.",
    },
  },
  phaseC: { ...phaseC, answerAll: "Answer all five questions to continue.", couldNotContinue: "Could not continue" },
  phaseD: {
    ...phaseD,
    title: "Your reflection",
    backToRatings: "Back to ratings",
    answerAll: "Please answer all questions to complete the trial.",
    couldNotComplete: "Could not complete the trial",
  },
  final: { ...finalText, items: finalQuestionnaire, defaultAnchors: ["strongly disagree", "strongly agree"] },
  completion: { ...completionText, participantId: "Participant ID", completedAt: "completed" },
  ui: {
    saving: "Saving…",
    saved: "Saved",
    notSaved: (err) => `Not saved (${err}) – retrying`,
    retrying: "retrying",
    loading: "Loading",
    somethingWrong: "Something went wrong",
    couldNotCheck: "Could not check",
    couldNotGoBack: "Could not go back",
  },
  header: {
    participant: "Participant",
    stages: { consent: "Consent", background: "Background", introduction: "Introduction", tutorial: "Gesture catalog", practice: "Practice", trials: "Trials", final: "Final questionnaire", complete: "Complete" },
  },
  errors: {
    noPractice: "No practice trial was created for this participant. Please tell the experimenter.",
    trialNotFound: (order) => `Trial ${order} was not found for this participant. Please tell the experimenter.`,
  },
  families: GESTURE_FAMILIES,
  gestures: Object.fromEntries(gestures.map((g) => [g.id, { label: g.label, description: g.description }])) as Dictionary["gestures"],
  commands: Object.fromEntries(commands.map((c) => [c.id, { label: c.label, description: c.description }])) as Dictionary["commands"],
  blocks: Object.fromEntries(commandBlocks.map((b) => [b.id, b.label])) as Dictionary["blocks"],
  objects: {},
};
