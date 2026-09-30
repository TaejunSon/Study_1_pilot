import type { ExpertiseCategory } from "@/types/study";

/** Participant background questionnaire (page 3). */
export const backgroundQuestionnaire = {
  roles: [
    { value: "faculty", label: "Faculty / principal investigator" },
    { value: "postdoc", label: "Postdoctoral researcher" },
    { value: "phd_student", label: "PhD student" },
    { value: "ms_student", label: "Master's student" },
    { value: "industry_researcher", label: "Industry researcher" },
    { value: "designer_engineer", label: "Interaction designer / engineer" },
    { value: "other", label: "Other (please specify)" },
  ],
  categories: [
    { value: "gesture_interaction_design", label: "Gesture interaction design" },
    { value: "gesture_elicitation", label: "Gesture elicitation" },
    { value: "gesture_recognition", label: "Gesture recognition" },
    { value: "imu_interaction", label: "IMU-based interaction" },
    { value: "vision_hand_interaction", label: "Vision-based hand interaction" },
    { value: "xr_interaction", label: "XR interaction" },
    { value: "user_study_evaluation", label: "User study / evaluation" },
    { value: "other", label: "Other (please specify)" },
  ] as { value: ExpertiseCategory; label: string }[],
  years: [
    { key: "hciYears", label: "HCI experience (years)" },
    { key: "xrYears", label: "XR experience (years)" },
    { key: "gestureYears", label: "Gesture-related research or professional experience (years)" },
  ] as const,
  expertisePrompt: "Please briefly describe your relevant expertise (projects, systems, studies, methods).",
};

export type FinalItemType = "likert7" | "text" | "textarea";
export interface FinalItem { key: string; type: FinalItemType; prompt: string; required?: boolean; anchors?: [string, string] }

/** Final questionnaire (page 8). Edit freely; answers are stored as JSON keyed by `key`. */
export const finalQuestionnaire: FinalItem[] = [
  { key: "catalog_clarity",   type: "likert7", required: true, prompt: "The 14 gestures in the catalog were clearly distinguishable from each other.", anchors: ["strongly disagree", "strongly agree"] },
  { key: "task_understanding", type: "likert7", required: true, prompt: "I could imagine holding the target object with one hand well enough to judge the gestures.", anchors: ["strongly disagree", "strongly agree"] },
  { key: "recommendation_quality", type: "likert7", required: true, prompt: "Overall, the system recommendations were appropriate for the situations shown.", anchors: ["strongly disagree", "strongly agree"] },
  { key: "considerations", type: "textarea", required: true, prompt: "Looking back over all trials, which considerations did you rely on most when choosing gestures? Please describe them in your own words." },
  { key: "missing_gestures", type: "textarea", prompt: "Were there gestures you wanted to choose that were not in the catalog? Which, and for which situations?" },
  { key: "recommendation_feedback", type: "textarea", prompt: "Is there anything about the system recommendations you would change (what they got right, what they missed)?" },
  { key: "comments", type: "textarea", prompt: "Any other comments about the study or the materials?" },
];
