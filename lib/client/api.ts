"use client";
import { ZodError } from "zod";
import {
  backToEvaluation, currentDb, FlowError, getTrial, lockElicitation, revealIfAvailable, saveElicitationDraft,
  saveEvaluation, saveReflection, submitBackground, submitConsent, submitFinal, submitProgress,
} from "@/lib/local/engine";
import { StorageUnavailableError } from "@/lib/local/state";
import { elicitationDraftSchema, ratingsDraftSchema, reflectionDraftSchema } from "@/lib/validation/schemas";

/**
 * The study's API, running entirely in the browser.
 *
 * The server app talked to `/api/...` route handlers; this build has no server, so the same call signature is
 * answered here from localStorage. Keeping the paths and payloads identical is deliberate: every form and the trial
 * runner are the files from the server app, unmodified, so the two builds cannot drift apart in what they record.
 */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

type Init = { method?: string; body?: unknown };

function fail(e: unknown): never {
  if (e instanceof ZodError) {
    const issues = e.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    throw new ApiError(422, issues.map((i) => i.message).join("; ") || "Please check your answers", { issues });
  }
  if (e instanceof StorageUnavailableError) throw new ApiError(0, e.message);
  if (e instanceof FlowError) throw new ApiError(409, e.message, { redirect: e.redirect });
  throw new ApiError(500, e instanceof Error ? e.message : "Something went wrong");
}

/** /api/trials/<order>/<rest> -> [order, rest] */
function trialRoute(path: string): [number, string] | null {
  const m = /^\/api\/trials\/(\d+)(?:\/(.*))?$/.exec(path);
  return m ? [Number(m[1]), m[2] ?? ""] : null;
}

async function dispatch(path: string, init: Init): Promise<unknown> {
  const body = init.body;

  switch (path) {
    case "/api/consent":    return submitConsent(currentDb(), body);
    case "/api/background": return submitBackground(currentDb(), body);
    case "/api/progress":   return submitProgress(currentDb(), body);
    case "/api/final":      return submitFinal(currentDb(), body);
  }

  const route = trialRoute(path);
  if (route) {
    const [order, rest] = route;
    const db = currentDb();
    switch (rest) {
      case "":                 return getTrial(db, order);
      case "elicitation":      saveElicitationDraft(db, order, elicitationDraftSchema.parse(body)); return { ok: true };
      case "lock":             return body == null ? revealIfAvailable(db, order) : lockElicitation(db, order, elicitationDraftSchema.parse(body));
      case "evaluation":       return saveEvaluation(db, order, ratingsDraftSchema.parse(body));
      case "evaluation/back":  return backToEvaluation(db, order);
      case "reflection":       return saveReflection(db, order, reflectionDraftSchema.parse(body));
    }
  }

  throw new ApiError(404, `No such route: ${path}`);
}

/**
 * Same signature as the server app's fetch helper, so the copied components need no change. It is async because the
 * callers await it (and because autosave expects a promise), but the work is synchronous and cannot fail on the
 * network — there is none.
 */
export async function api<T>(path: string, init: Init = {}): Promise<T> {
  try {
    return (await dispatch(path, init)) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    return fail(e);
  }
}
