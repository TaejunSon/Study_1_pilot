/**
 * Participant-facing copy for the non-trial pages. No evaluation dimensions and no internal terminology appear here.
 */
export const landingText = {
  title: "Gesture selection for hands-busy AR interaction",
  subtitle: "Expert study",
  body: [
    "Thank you for taking part. In this session you will watch short first-person videos, imagine holding the highlighted object with one hand, and choose gestures for AR commands.",
    "Please enter the participant ID given to you by the experimenter. If you have already started, entering the same ID resumes your session where you left off.",
  ],
  idLabel: "Participant ID",
  idPlaceholder: "e.g. E01",
  start: "Start / resume",
};

export const consentText = {
  title: "Informed consent",
  sections: [
    { heading: "Purpose", body: "This study collects expert judgments about which hand or object gestures are appropriate for controlling an augmented-reality (AR) instruction system while the hands are occupied with everyday objects." },
    { heading: "Procedure", body: "You will answer a short background questionnaire, review a gesture catalog, complete one practice trial, and then complete a series of trials. In each trial you watch a short video, choose gestures for one AR command, and then review and rate a system-generated recommendation. A short questionnaire concludes the session. The session takes about 90 to 120 minutes." },
    { heading: "Data", body: "Your responses, timestamps, and your background information are stored under your participant ID. No video or audio of you is recorded. The data will be analysed and reported in aggregated or anonymised form." },
    { heading: "Voluntary participation", body: "Participation is voluntary. You may stop at any time without giving a reason. Responses already saved will be kept unless you ask for them to be deleted." },
    { heading: "Contact", body: "If you have questions about the study, please ask the experimenter at any time." },
  ],
  checkbox: "I have read the information above and agree to take part in this study.",
  agree: "I agree, continue",
};

export const introductionText = {
  title: "About the study",
  bullets: [
    "This study uses the 18 videos from the existing base task. Each video shows a situation in which a person is about to pick up a specific object.",
    "In each trial, imagine that you are naturally holding the target object with one hand, in the way the situation suggests.",
    "For the AR command shown, you will choose gestures from a fixed catalog of 14 gestures. There is no single correct gesture.",
    "Use whatever considerations you personally think are important. We are interested in your own judgment and your own reasons.",
    "After you have made and submitted your own selection, a system recommendation for the same command will be shown, and you will be asked to review it.",
    "Once you submit your own selection, it cannot be changed. Take the time you need before submitting.",
    "Your answers are saved automatically. If the browser closes, you can resume by entering your participant ID again.",
  ],
  continue: "Continue to the gesture catalog",
};

export const tutorialText = {
  title: "Gesture catalog",
  body: [
    "The catalog contains 14 gestures in two groups. The cards appear in the same order in every trial.",
    "Please read each card. If a demonstration is available, it plays inside the card.",
  ],
  acknowledge: "I have reviewed all 14 gestures and understand the two groups.",
  continue: "Continue to the practice trial",
};

export const practiceText = {
  banner: "Practice trial. This trial is for getting used to the screens; its answers are not part of the study data.",
  done: "Practice complete. The main trials start next.",
  continue: "Start the main trials",
};

export const trialText = {
  imagine: "Imagine you are holding this object naturally with one hand.",
  commandLabel: "AR command",
  targetLabel: "Target object",
  phaseALabel: "Your selection",
  phaseCLabel: "System recommendation",
  phaseDLabel: "Your reflection",
  locked: "Your selection has been submitted and can no longer be changed.",
  awaiting: "The system recommendation for this trial is not available yet. Please tell the experimenter. Your selection has been saved.",
  retry: "Check again",
  nextTrial: "Next trial",
  yourBest: "Your most appropriate gesture",
  systemGesture: "System recommendation",
};

export const finalText = {
  title: "Final questionnaire",
  body: "A few closing questions about the session as a whole.",
  submit: "Submit and finish",
};

export const completionText = {
  title: "Thank you",
  body: [
    "You have completed all trials and the final questionnaire. Your responses have been saved.",
    "Please let the experimenter know that you are finished.",
  ],
};
