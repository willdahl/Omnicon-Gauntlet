import type { PreGuardrailStage, PostGuardrailStage } from "../types";
import { languageGuard } from "./language";
import { locatabilityGuard, groundingGuard } from "./grounding";
import { scopedDiffGuard } from "./scoped-diff";

/**
 * Central guardrail stage registry.
 *
 * Each guardrail adds itself here with a single import line so the shared
 * pipeline config stays merge-conflict-free as new guardrails land.
 *
 * Ordering: cheap/deterministic guards run first so they short-circuit before
 * the costlier semantic (LLM) guards. languageGuard is a deterministic
 * non-LLM check; the (future) injection guards belong between it and the
 * semantic guards below. G2 (locatability) and G3 (grounding) are the semantic
 * LLM guards and share a single classifier call per request.
 */
export const preStages: PreGuardrailStage[] = [
  languageGuard,
  locatabilityGuard,
  groundingGuard,
];

export const postStages: PostGuardrailStage[] = [scopedDiffGuard];
