import { runPipeline, defaultPipelineConfig } from "./pipeline";
import {
  TEST_CASES,
  type TestCase,
  type SideEffect,
  type TestExpected,
} from "./test-fixtures";
import type { FlagReason } from "./types";
import { DEFAULT_MODEL } from "../models";

export type TestStatus = "pending" | "running" | "pass" | "fail";

export interface TestTelemetry {
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  estimatedCostUsd: number | null;
}

export interface TestCaseResult {
  id: string;
  guardrail: string;
  status: TestStatus;
  reason?: string;
  telemetry?: TestTelemetry;
  /** What this case exercises (known up front, sent on the running event). */
  description?: string;
  /** Input (v1) — known up front. */
  inputTranscript?: string;
  inputSummary?: string;
  feedback?: string;
  /** Output (v2) — populated once the pipeline produces a result. */
  outputTranscript?: string;
  outputSummary?: string;
  /** Expected assertions for this case (known up front). */
  expected?: TestExpected;
}

function evaluateResult(
  tc: TestCase,
  output: Awaited<ReturnType<typeof runPipeline>>,
): { pass: boolean; reason?: string } {
  const { guardrailResult } = output;
  const failures: string[] = [];

  // ── 1. Validate expected flag reasons ──────────────────────────────────────
  if (tc.expected.flagged_reasons && tc.expected.flagged_reasons.length > 0) {
    const expectedReasons = new Set<FlagReason>(tc.expected.flagged_reasons);
    const actualReasons = new Set<FlagReason>(
      guardrailResult.flagged.map((f) => f.reason),
    );
    const missing = [...expectedReasons].filter((r) => !actualReasons.has(r));
    if (missing.length > 0) {
      failures.push(
        `Missing guardrail: expected flag reason(s) [${missing.join(", ")}] were not emitted. ` +
          `Guardrail stage is not yet implemented.`,
      );
    }
  }

  // ── 2. Validate side effects ────────────────────────────────────────────────
  for (const effect of tc.expected.side_effects ?? []) {
    const verdict = checkSideEffect(effect, output);
    if (verdict) failures.push(verdict);
  }

  // ── 3. Validate edited spans in the output ─────────────────────────────────
  for (const span of tc.expected.edited_spans ?? []) {
    const content =
      span.field === "v2Summary"
        ? (output.output?.v2Summary ?? "")
        : (output.output?.v2Transcript ?? "");

    const found = content.includes(span.substring);

    if (span.present && !found) {
      failures.push(
        `Edited span missing: expected "${span.substring}" to be present in ${span.field} but it was not found.`,
      );
    } else if (!span.present && found) {
      failures.push(
        `Unexpected span: "${span.substring}" should NOT appear in ${span.field} ` +
          `(guardrail did not block the ungrounded/injected/out-of-scope content).`,
      );
    }
  }

  if (failures.length === 0) return { pass: true };
  return { pass: false, reason: failures.join(" | ") };
}

function checkSideEffect(
  effect: SideEffect,
  output: Awaited<ReturnType<typeof runPipeline>>,
): string | null {
  switch (effect) {
    case "pipeline_blocked":
      if (!output.blocked) {
        return (
          `pipeline_blocked expected: the pipeline should have short-circuited before calling the LLM, ` +
          `but it ran and produced output. The guardrail pre-stage must block this request.`
        );
      }
      return null;

    case "pipeline_not_blocked":
      if (output.blocked) {
        return (
          `pipeline_not_blocked expected: a valid request was incorrectly blocked. ` +
          `Block reason: ${output.blockReason ?? "unknown"}.`
        );
      }
      return null;

    case "no_content_added":
      if (output.output !== null && output.output.changeExplanation.trim().length > 0) {
        return `no_content_added expected: the regeneration should have produced no changes but a change explanation was emitted.`;
      }
      return null;
  }
}

async function runSingleCase(
  tc: TestCase,
  onProgress?: (result: TestCaseResult) => void,
): Promise<TestCaseResult> {
  // Case metadata known before the LLM runs (input side of the before/after).
  const base = {
    id: tc.id,
    guardrail: tc.guardrail,
    description: tc.description,
    inputTranscript: tc.fixture.v1Transcript ?? "",
    inputSummary: tc.fixture.v1Summary,
    feedback: tc.feedback,
    expected: tc.expected,
  };

  onProgress?.({ ...base, status: "running" });

  const start = Date.now();
  let result: TestCaseResult;

  try {
    const pipelineOutput = await runPipeline(
      {
        v1Transcript: tc.fixture.v1Transcript ?? "",
        v1Summary: tc.fixture.v1Summary,
        feedback: tc.feedback,
        model: DEFAULT_MODEL,
        temperature: 0,
      },
      defaultPipelineConfig,
    );

    const latencyMs = Date.now() - start;
    const evaluation = evaluateResult(tc, pipelineOutput);

    const telemetry: TestTelemetry = pipelineOutput.output
      ? {
          model: pipelineOutput.output.observability.model,
          inputTokens: pipelineOutput.output.observability.inputTokens,
          outputTokens: pipelineOutput.output.observability.outputTokens,
          latencyMs,
          estimatedCostUsd:
            pipelineOutput.output.observability.estimatedCostUsd,
        }
      : {
          model: DEFAULT_MODEL,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs,
          estimatedCostUsd: null,
        };

    result = {
      ...base,
      status: evaluation.pass ? "pass" : "fail",
      reason: evaluation.reason,
      telemetry,
      outputTranscript: pipelineOutput.output?.v2Transcript,
      outputSummary: pipelineOutput.output?.v2Summary,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result = {
      ...base,
      status: "fail",
      reason: `Test runner error: ${message}`,
      telemetry: {
        model: DEFAULT_MODEL,
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: Date.now() - start,
        estimatedCostUsd: null,
      },
    };
  }

  onProgress?.(result);
  return result;
}

/**
 * Runs all guardrail test cases concurrently. Each case streams its own
 * "running" event and final result via `onProgress` as it progresses (so the
 * panel updates live, out of completion order), while the returned array
 * preserves the original TEST_CASES order for the final summary.
 *
 * Each case catches its own errors and resolves to a "fail" result, so a single
 * failing case never aborts the rest of the suite.
 */
export async function runTestSuite(
  onProgress?: (result: TestCaseResult) => void,
): Promise<TestCaseResult[]> {
  return Promise.all(TEST_CASES.map((tc) => runSingleCase(tc, onProgress)));
}
