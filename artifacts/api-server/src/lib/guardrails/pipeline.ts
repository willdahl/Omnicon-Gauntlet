import { regenerate, type RegenerateInput, type RegenerateOutput } from "../regenerate";
import type {
  GuardrailContext,
  GuardrailResult,
  PreGuardrailStage,
  PostGuardrailStage,
} from "./types";
import { PASS } from "./types";

export interface PipelineConfig {
  preStages?: PreGuardrailStage[];
  postStages?: PostGuardrailStage[];
}

export interface PipelineResult {
  output: RegenerateOutput | null;
  guardrailResult: GuardrailResult;
  blocked: boolean;
  blockReason?: string;
}

function mergeResults(results: GuardrailResult[]): GuardrailResult {
  const flagged = results.flatMap((r) => r.flagged);
  const blocked = results.some((r) => r.blocked);
  const blockReason = results.find((r) => r.blocked)?.reason;
  const pass = results.every((r) => r.pass);
  return { pass, flagged, blocked, reason: blockReason };
}

export async function runPipeline(
  ctx: GuardrailContext,
  config: PipelineConfig = {},
): Promise<PipelineResult> {
  const preResults: GuardrailResult[] = [];

  for (const stage of config.preStages ?? []) {
    const result = await stage(ctx);
    preResults.push(result);
    if (result.blocked) {
      return {
        output: null,
        guardrailResult: mergeResults(preResults),
        blocked: true,
        blockReason: result.reason,
      };
    }
  }

  const regenInput: RegenerateInput = {
    v1Transcript: ctx.v1Transcript,
    v1Summary: ctx.v1Summary,
    feedback: ctx.feedback,
    flaggedSegments: ctx.flaggedSegments,
    model: ctx.model,
    temperature: ctx.temperature,
  };

  const output = await regenerate(regenInput);

  const postResults: GuardrailResult[] = [];
  for (const stage of config.postStages ?? []) {
    const result = await stage(ctx, output);
    postResults.push(result);
  }

  const allResults = [...preResults, ...postResults];
  const combined =
    allResults.length > 0 ? mergeResults(allResults) : { ...PASS };

  // Post-stage enforcement: if any post-stage blocked the result, surface that.
  // The output is returned so callers can inspect it, but pipelineResult.blocked
  // signals that the content should not be shown to the user.
  return {
    output,
    guardrailResult: combined,
    blocked: combined.blocked,
    blockReason: combined.reason,
  };
}

export const defaultPipelineConfig: PipelineConfig = {
  preStages: [],
  postStages: [],
};
