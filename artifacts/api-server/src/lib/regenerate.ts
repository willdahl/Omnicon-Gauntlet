import { openrouter } from "@workspace/integrations-openrouter-ai";
import { estimateCostUsd } from "./models";

export interface RegenerateInput {
  v1Transcript: string;
  v1Summary: string;
  feedback: string;
  flaggedSegments?: string[];
  model: string;
}

export interface Observability {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  estimatedCostUsd: number | null;
  finishReason: string;
  reasoning: string | null;
}

export interface RegenerateOutput {
  v2Transcript: string;
  v2Summary: string;
  changeExplanation: string;
  observability: Observability;
}

// Thrown when the LLM call fails or returns an unusable response. Always
// retryable from the caller's perspective — no silent fallback to mock data.
export class RegenerationError extends Error {
  retryable: boolean;
  constructor(message: string, retryable = true) {
    super(message);
    this.name = "RegenerationError";
    this.retryable = retryable;
  }
}

const REQUEST_TIMEOUT_MS = 180_000;

const T_OPEN = "<<<V2_TRANSCRIPT>>>";
const T_CLOSE = "<<<END_V2_TRANSCRIPT>>>";
const S_OPEN = "<<<V2_SUMMARY>>>";
const S_CLOSE = "<<<END_V2_SUMMARY>>>";
const E_OPEN = "<<<CHANGE_EXPLANATION>>>";
const E_CLOSE = "<<<END_CHANGE_EXPLANATION>>>";

function buildPrompt(input: RegenerateInput): string {
  const flagged =
    input.flaggedSegments && input.flaggedSegments.length > 0
      ? `\n\nThe user also flagged these specific segments for attention:\n${input.flaggedSegments
          .map((s, i) => `${i + 1}. ${s}`)
          .join("\n")}`
      : "";

  return `You are the regeneration engine for OMNICON, a human-in-the-loop meeting-intelligence tool.

You are given:
1. A V1 meeting TRANSCRIPT.
2. A V1 SUMMARY generated from that transcript.
3. The user's REVIEW FEEDBACK, structured as "what matched (leave unchanged)" and "what didn't match (please correct)", with each correction grounded in a transcript quote.

Your job:
- Produce a corrected V2 TRANSCRIPT that honors the feedback. Only change what the feedback asks for (e.g. fixing speaker labels, attendee lists, or clear transcription issues the feedback identifies). Preserve everything else verbatim. Do NOT invent content that is not supported by the original transcript.
- Regenerate the V2 SUMMARY *from the corrected V2 transcript*, incorporating every "what didn't match" correction and preserving every "what matched" item. Keep the original summary's overall structure/headings where sensible.
- Write a plain-English CHANGE EXPLANATION describing what you changed and why, referencing the specific feedback points. Be concrete and concise.

Output format — emit each section between its exact delimiters, in this order, and NOTHING else (no markdown code fences, no commentary outside the delimiters). The content between delimiters may span multiple lines:

${T_OPEN}
(full corrected V2 transcript here)
${T_CLOSE}
${S_OPEN}
(full regenerated V2 summary here, markdown allowed)
${S_CLOSE}
${E_OPEN}
(plain-English explanation of what changed and why)
${E_CLOSE}

=== V1 TRANSCRIPT ===
${input.v1Transcript}

=== V1 SUMMARY ===
${input.v1Summary}

=== REVIEW FEEDBACK ===
${input.feedback}${flagged}`;
}

function extractBetween(
  raw: string,
  open: string,
  close: string,
): string | null {
  const start = raw.indexOf(open);
  if (start === -1) return null;
  const contentStart = start + open.length;
  const end = raw.indexOf(close, contentStart);
  const slice = end === -1 ? raw.slice(contentStart) : raw.slice(contentStart, end);
  return slice.replace(/^\n/, "").replace(/\n$/, "");
}

export async function regenerate(
  input: RegenerateInput,
): Promise<RegenerateOutput> {
  const prompt = buildPrompt(input);
  const start = Date.now();

  let completion;
  try {
    completion = await openrouter.chat.completions.create(
      {
        model: input.model,
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
        // OpenRouter-specific: request reasoning traces when the provider
        // exposes them. Cast because this is not in the base OpenAI types.
        ...({ reasoning: { enabled: true } } as Record<string, unknown>),
      },
      { timeout: REQUEST_TIMEOUT_MS, maxRetries: 1 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new RegenerationError(`LLM request failed: ${message}`, true);
  }

  const latencyMs = Date.now() - start;
  const choice = completion.choices?.[0];

  if (!choice?.message?.content) {
    throw new RegenerationError(
      "LLM returned an empty response (no content).",
      true,
    );
  }

  const raw = choice.message.content;
  const v2Transcript = extractBetween(raw, T_OPEN, T_CLOSE);
  const v2Summary = extractBetween(raw, S_OPEN, S_CLOSE);
  const changeExplanation = extractBetween(raw, E_OPEN, E_CLOSE);

  if (
    v2Transcript === null ||
    v2Transcript.length === 0 ||
    v2Summary === null ||
    v2Summary.length === 0 ||
    changeExplanation === null ||
    changeExplanation.length === 0
  ) {
    throw new RegenerationError(
      `LLM response missing required delimited sections (finish reason: ${
        choice.finish_reason ?? "unknown"
      }). The model may have been truncated or ignored the output format.`,
      true,
    );
  }

  const usage = completion.usage;
  const inputTokens = usage?.prompt_tokens ?? 0;
  const outputTokens = usage?.completion_tokens ?? 0;
  const totalTokens = usage?.total_tokens ?? inputTokens + outputTokens;

  const estimatedCostUsd = await estimateCostUsd(
    input.model,
    inputTokens,
    outputTokens,
  );

  // Reasoning text is exposed by OpenRouter on the message as `reasoning`
  // (not part of the base OpenAI types) for providers that surface it.
  const messageWithReasoning = choice.message as { reasoning?: unknown };
  const reasoning =
    typeof messageWithReasoning.reasoning === "string" &&
    messageWithReasoning.reasoning.trim().length > 0
      ? messageWithReasoning.reasoning
      : null;

  return {
    v2Transcript,
    v2Summary,
    changeExplanation,
    observability: {
      model: completion.model ?? input.model,
      inputTokens,
      outputTokens,
      totalTokens,
      latencyMs,
      estimatedCostUsd,
      finishReason: choice.finish_reason ?? "unknown",
      reasoning,
    },
  };
}
