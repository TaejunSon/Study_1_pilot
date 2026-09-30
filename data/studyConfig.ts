import type { BlockId } from "@/types/study";

/** Study-level configuration (no UI, no content text). */
export const studyConfig = {
  studyName: "Gesture selection for hands-busy AR interaction",
  consentVersion: "2026-09-v1",

  trialDesign: {
    /** false: the shuffled scenes run in one sequence (a scene's active commands stay adjacent, in block order). */
    groupTrialsByBlock: false as boolean,
    blockOrder: ["NAV", "CTRL"] as BlockId[],
    /** when grouping by block: alternate the block order between participants (seed parity). */
    counterbalanceBlockOrder: true,
  },

  randomization: {
    /** true: seed = hash(participantId + STUDY_SALT) so a participant's order is reproducible from the ID alone;
     *  false: a random 32-bit seed is drawn at creation. The seed and the resulting order are always stored. */
    seedFromParticipantId: true,
  },

  autosave: { debounceMs: 800, retryMs: 3000 },

  /** scene.description is for the experimenter; keep this false so no extra framing reaches participants. */
  showSceneDescriptionToParticipants: false,

  elicitation: { requireReason: true, minReasonChars: 3 },

  likert: { min: 1, max: 7 },
  /**
   * Every participant answers the SAME Phase D questions in every trial (decision 2026-09-23), so nothing here
   * changes what is shown. `lowRatingThreshold` only labels the stored analysis flags: a trial is marked
   * "low_rating" when any of Q5-Q8 is at or below it (qualitative_responses.probing_reasons).
   */
  probing: { lowRatingThreshold: 4 },

  video: { loop: true, muted: true, autoplay: true },

  /** exports: include practice trials? */
  exports: { includePractice: false },
} as const;
