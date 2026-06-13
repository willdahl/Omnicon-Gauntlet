import type { RegenerateOutput } from "../regenerate";

export type FlagReason =
  | "unlocatable"
  | "ungrounded"
  | "out_of_scope"
  | "unsupported_language"
  | "injection"
  | "low_confidence";

export interface FlaggedItem {
  reason: FlagReason;
  detail?: string;
  span?: string;
}

export interface GuardrailResult {
  pass: boolean;
  flagged: FlaggedItem[];
  blocked: boolean;
  reason?: string;
}

export interface GuardrailContext {
  v1Transcript: string;
  v1Summary: string;
  feedback: string;
  flaggedSegments?: string[];
  model: string;
  temperature?: number;
  override?: boolean;
}

/**
 * Pre-processing stage: runs before the LLM call.
 * Can block the request entirely by returning blocked: true.
 */
export type PreGuardrailStage = (ctx: GuardrailContext) => Promise<GuardrailResult>;

/**
 * Post-processing stage: runs after the LLM call and receives both
 * the original context and the regeneration output for inspection.
 */
export type PostGuardrailStage = (
  ctx: GuardrailContext,
  output: RegenerateOutput,
) => Promise<GuardrailResult>;

/**
 * Legacy alias — defaults to pre-stage shape for backwards compatibility.
 */
export type GuardrailStage = PreGuardrailStage;

export const PASS: GuardrailResult = {
  pass: true,
  flagged: [],
  blocked: false,
};
