import { z } from "zod";
import { COMMAND_IDS, GESTURE_IDS, VERDICTS } from "@/types/study";
import { studyConfig } from "@/data/studyConfig";
import { backgroundQuestionnaire, finalQuestionnaire } from "@/data/questionnaires";

// ---------------------------------------------------------------- shared
export const gestureIdSchema = z.enum(GESTURE_IDS);
export const commandIdSchema = z.enum(COMMAND_IDS);
export const verdictSchema = z.enum(VERDICTS);
export const participantIdSchema = z.string().trim().regex(/^[A-Za-z0-9_-]{1,32}$/, "Participant ID: 1-32 letters, digits, - or _");
export const likertSchema = z.number().int().min(studyConfig.likert.min).max(studyConfig.likert.max);
const text = (max = 5000) => z.string().max(max);

// ---------------------------------------------------------------- participants
export const createParticipantSchema = z.object({ participantId: participantIdSchema });

export const consentSchema = z.object({ agreed: z.literal(true), consentVersion: z.string().min(1) });

const categoryValues = backgroundQuestionnaire.categories.map((c) => c.value) as [string, ...string[]];
export const backgroundSchema = z
  .object({
    role: z.string().min(1, "Please select a role"),
    roleOther: text(200).optional(),
    hciYears: z.number().min(0).max(60),
    xrYears: z.number().min(0).max(60),
    gestureYears: z.number().min(0).max(60),
    categories: z.array(z.enum(categoryValues)).min(1, "Select at least one category"),
    categoriesOther: text(300).optional(),
    expertise: z.string().trim().min(3, "Please describe your expertise").max(5000),
  })
  .refine((b) => b.role !== "other" || (b.roleOther ?? "").trim().length > 0, { path: ["roleOther"], message: "Please specify your role" })
  .refine((b) => !b.categories.includes("other") || (b.categoriesOther ?? "").trim().length > 0, { path: ["categoriesOther"], message: "Please specify the other category" });

export const progressSchema = z.object({ from: z.enum(["introduction", "tutorial", "practice"]) });

// ---------------------------------------------------------------- phase A
export const elicitationDraftSchema = z.object({
  selected: z.array(gestureIdSchema).max(14),
  best: gestureIdSchema.nullable(),
  reason: text(),
  excluded: z.array(gestureIdSchema).max(14),
  exclusionReason: text(),
});
export type ElicitationDraft = z.infer<typeof elicitationDraftSchema>;

export const elicitationLockSchema = elicitationDraftSchema
  .refine((d) => d.selected.length >= 1, { path: ["selected"], message: "Select at least one gesture" })
  .refine((d) => d.best !== null && d.selected.includes(d.best), { path: ["best"], message: "Choose the most appropriate gesture from your selection" })
  .refine((d) => !studyConfig.elicitation.requireReason || d.reason.trim().length >= studyConfig.elicitation.minReasonChars, { path: ["reason"], message: "Please give your reason" })
  .refine((d) => d.excluded.length === 0 || d.exclusionReason.trim().length > 0, { path: ["exclusionReason"], message: "Please say why you excluded these gestures" })
  .refine((d) => d.excluded.every((g) => !d.selected.includes(g)), { path: ["excluded"], message: "An excluded gesture cannot also be selected" });

// ---------------------------------------------------------------- phase C
export const ratingsDraftSchema = z.object({
  feasibility: likertSchema.nullable(),
  task_compatibility: likertSchema.nullable(),
  safety: likertSchema.nullable(),
  semantic_compatibility: likertSchema.nullable(),
  verdict: verdictSchema.nullable(),
  submit: z.boolean().default(false),
});
export type RatingsDraft = z.infer<typeof ratingsDraftSchema>;
export const ratingsSubmitSchema = z.object({
  feasibility: likertSchema,
  task_compatibility: likertSchema,
  safety: likertSchema,
  semantic_compatibility: likertSchema,
  verdict: verdictSchema,
});

// ---------------------------------------------------------------- phase D
export const reflectionDraftSchema = z.object({
  system_reason: text(),
  scene_evidence: text(),
  contrast_reason: text(),
  generalization: text(),
  submit: z.boolean().default(false),
});
export type ReflectionDraft = z.infer<typeof reflectionDraftSchema>;

/** All four Phase D answers are required, in every trial, for every participant. */
export const reflectionSubmitSchema = z.object({
  system_reason: z.string().trim().min(1, "Please answer this question").max(5000),
  scene_evidence: z.string().trim().min(1, "Please answer this question").max(5000),
  contrast_reason: z.string().trim().min(1, "Please answer this question").max(5000),
  generalization: z.string().trim().min(1, "Please answer this question").max(5000),
});

// ---------------------------------------------------------------- final questionnaire
export const finalSchema = z.object(
  Object.fromEntries(
    finalQuestionnaire.map((item) => {
      if (item.type === "likert7") return [item.key, item.required ? likertSchema : likertSchema.nullable().optional()];
      const s = item.required ? z.string().trim().min(1, "Required").max(5000) : text().optional();
      return [item.key, s];
    }),
  ) as Record<string, z.ZodTypeAny>,
);

// ---------------------------------------------------------------- admin
export const adminLoginSchema = z.object({ password: z.string().min(1) });
export const gptCallSchema = z.object({ sceneId: z.string().min(1), commandId: commandIdSchema, model: z.string().min(1).optional(), promptVersion: z.string().min(1).optional() });
export const saveCanonicalSchema = z.object({ gptCallLogId: z.string().uuid(), sceneId: z.string().min(1), commandIds: z.array(commandIdSchema).min(1) });
export const setOverrideSchema = z.object({ participantId: participantIdSchema, gptCallLogId: z.string().uuid(), sceneId: z.string().min(1), commandIds: z.array(commandIdSchema).min(1) });
export const useStoredSchema = z.object({ participantId: participantIdSchema, sceneId: z.string().min(1), commandId: commandIdSchema });
export const precomputeSchema = z.object({ onlyMissing: z.boolean().default(true), sceneIds: z.array(z.string()).optional(), blockIds: z.array(z.enum(["NAV", "CTRL"])).optional() });
