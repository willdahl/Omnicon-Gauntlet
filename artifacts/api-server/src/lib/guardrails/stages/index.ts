import type { PreGuardrailStage, PostGuardrailStage } from "../types";
import { languageGuard } from "./language";
import { scopedDiffGuard } from "./scoped-diff";

/**
 * Central guardrail stage registry.
 *
 * Each guardrail adds itself here with a single import line so the shared
 * pipeline config stays merge-conflict-free as new guardrails land.
 */
export const preStages: PreGuardrailStage[] = [languageGuard];

export const postStages: PostGuardrailStage[] = [scopedDiffGuard];
