import { openrouter } from "@workspace/integrations-openrouter-ai";
import type {
  GuardrailContext,
  GuardrailResult,
  PreGuardrailStage,
} from "../types";
import { PASS } from "../types";

/**
 * Structured verdict from the shared semantic classifier. The classifier makes
 * exactly ONE temperature=0 LLM call and answers two independent questions:
 *
 *  - locatable: does every item the feedback *references* actually exist in the
 *    source (summary + transcript)? If the feedback points at an entity, fact,
 *    or field that appears nowhere in the source, it is unlocatable.
 *  - grounded: is every addition the feedback *requests* supported by the
 *    transcript? If the feedback asks to assert a new fact the transcript does
 *    not back up, it is ungrounded.
 */
export interface GroundingVerdict {
  locatable: boolean;
  unlocatable_detail: string;
  grounded: boolean;
  ungrounded_detail: string;
}

const CLASSIFIER_TIMEOUT_MS = 60_000;

const C_OPEN = "<<<VERDICT>>>";
const C_CLOSE = "<<<END_VERDICT>>>";

/**
 * Per-context memoization. G2 and G3 share one classifier call, so when both
 * stages run on the same request we issue the LLM call once and reuse the
 * verdict. Keyed by the GuardrailContext object identity (the same object is
 * threaded through every stage in a single pipeline run).
 */
const verdictCache = new WeakMap<GuardrailContext, Promise<GroundingVerdict>>();

function buildClassifierPrompt(ctx: GuardrailContext): string {
  return `You are a strict pre-flight reviewer for OMNICON, a meeting-intelligence tool that lets a human correct an AI-generated meeting summary. Before the summary is regenerated, you check the user's correction FEEDBACK against the SOURCE (the original transcript + summary) and answer two questions.

You are NOT rewriting anything. You only judge the feedback. Answer with calibrated, conservative judgment: only fail a check when there is a CLEAR problem. Reasonable paraphrase, synonyms, and inferences that the source genuinely supports must PASS.

First decide what KIND of edit the feedback is, because the two checks target different kinds:
- A CORRECTION/CHANGE/FIX/REMOVAL edit operates on something it treats as ALREADY PRESENT in the source ("the owner is wrong, it's Jordan", "change Monday to Tuesday", "fix the deadline for the design review", "remove the budget line").
- An ADDITION edit asks to INSERT a NEW claim or fact that is not currently in the summary ("add that the collaborator is giving me one million dollars", "note that we agreed to a refund").

QUESTION 1 — LOCATABLE (only about CORRECTION/CHANGE/FIX/REMOVAL edits)
When the feedback tries to correct, change, fix, or remove an item it treats as already present, does that target item actually exist in the SOURCE (transcript or summary)?
- locatable = false ONLY when the feedback asks to fix/change/remove a specific item (entity, person, date, deadline, field, topic, agenda item) that appears NOWHERE in the source (e.g. "fix the deadline for the design review" when there is no design review and no deadline anywhere). Inventing the target to "fix" it would be a hallucination, so it must be blocked.
- locatable = true otherwise — including when the target exists (even if phrased differently, abbreviated, or clearly implied), AND whenever the feedback is purely an ADDITION (there is no pre-existing target to locate, so locatability does not apply — leave it true).

QUESTION 2 — GROUNDED (only about ADDITION edits)
When the feedback asks to ADD or ASSERT a NEW claim/fact, is that new claim supported by the TRANSCRIPT?
- grounded = false ONLY when the feedback asks to add/assert a NEW fact the transcript does not support at all (e.g. "add that the collaborator is giving me one million dollars" when no such amount or promise appears anywhere in the transcript). Writing it in would fabricate a fact, so it must be blocked.
- grounded = true otherwise — including every CORRECTION/CHANGE/FIX/REMOVAL edit (those are not new unsupported additions), rewordings, and additions the transcript genuinely supports.

Decision guide (mutually-reinforcing, not double-counting):
- "owner is wrong, it should be Jordan" → correction of an existing item (owner exists) → locatable true, grounded true → PASS.
- "fix the deadline for the design review" (no design review anywhere) → correction of a missing target → locatable FALSE, grounded true.
- "add that the collaborator is giving me one million dollars" (no such amount in transcript) → addition of an unsupported claim → locatable true, grounded FALSE.
- "change Monday to Tuesday" (Monday is in the source) → ordinary correction → locatable true, grounded true → PASS.
- When uncertain but the source plausibly supports the feedback, prefer true (PASS). Do not penalize ordinary English editing requests.

Emit ONLY a single JSON object between the exact delimiters below, with no other text, no markdown fences, and no commentary. Keep the detail strings to one short sentence each (empty string when the check passes):

${C_OPEN}
{"locatable": true, "unlocatable_detail": "", "grounded": true, "ungrounded_detail": ""}
${C_CLOSE}

=== SOURCE TRANSCRIPT ===
${ctx.v1Transcript || "(none provided)"}

=== SOURCE SUMMARY ===
${ctx.v1Summary}

=== USER FEEDBACK ===
${ctx.feedback}`;
}

function extractJson(raw: string): string {
  const start = raw.indexOf(C_OPEN);
  if (start !== -1) {
    const contentStart = start + C_OPEN.length;
    const end = raw.indexOf(C_CLOSE, contentStart);
    const slice =
      end === -1 ? raw.slice(contentStart) : raw.slice(contentStart, end);
    return slice.trim();
  }
  // Fall back to the first balanced-looking JSON object if the model omitted
  // the delimiters but still produced JSON.
  const objStart = raw.indexOf("{");
  const objEnd = raw.lastIndexOf("}");
  if (objStart !== -1 && objEnd > objStart) {
    return raw.slice(objStart, objEnd + 1).trim();
  }
  return raw.trim();
}

function coerceVerdict(parsed: unknown): GroundingVerdict {
  const obj = (parsed ?? {}) as Record<string, unknown>;
  return {
    // Default to PASS (true) on any missing/odd field so a malformed verdict
    // never silently blocks a legitimate edit; the calibration goal is to block
    // only clear fabrications.
    locatable: obj.locatable !== false,
    unlocatable_detail:
      typeof obj.unlocatable_detail === "string" ? obj.unlocatable_detail : "",
    grounded: obj.grounded !== false,
    ungrounded_detail:
      typeof obj.ungrounded_detail === "string" ? obj.ungrounded_detail : "",
  };
}

/**
 * Runs the shared semantic classifier exactly once per GuardrailContext.
 *
 * Uses the same model resolution as the regeneration engine (the model carried
 * on the context) at temperature=0 for determinism. On any failure to obtain a
 * usable verdict, returns an all-pass verdict — these are the highest
 * false-positive-risk guards, so an unreachable classifier must not block.
 */
export async function classifyGrounding(
  ctx: GuardrailContext,
): Promise<GroundingVerdict> {
  const cached = verdictCache.get(ctx);
  if (cached) return cached;

  const promise = (async (): Promise<GroundingVerdict> => {
    const prompt = buildClassifierPrompt(ctx);
    try {
      const completion = await openrouter.chat.completions.create(
        {
          model: ctx.model,
          // Generous budget: the resolved models emit chain-of-thought inline
          // before the JSON verdict, and a tight cap truncates the response
          // mid-reasoning (no JSON -> fail-open). 4096 leaves room to finish
          // reasoning and still emit the small delimited verdict.
          max_tokens: 4096,
          temperature: 0,
          messages: [{ role: "user", content: prompt }],
        },
        { timeout: CLASSIFIER_TIMEOUT_MS, maxRetries: 1 },
      );

      const raw = completion.choices?.[0]?.message?.content;
      if (!raw || raw.trim().length === 0) {
        return coerceVerdict(null);
      }

      const jsonText = extractJson(raw);
      const parsed = JSON.parse(jsonText) as unknown;
      return coerceVerdict(parsed);
    } catch {
      // Fail open: never block a legitimate edit because the classifier was
      // unreachable or returned unparsable output.
      return coerceVerdict(null);
    }
  })();

  verdictCache.set(ctx, promise);
  return promise;
}

/**
 * G2 — Locatability guard (PRE).
 *
 * Blocks before regeneration when the feedback references something that does
 * not exist anywhere in the source, so the engine cannot invent it.
 */
export const locatabilityGuard: PreGuardrailStage = async (
  ctx: GuardrailContext,
): Promise<GuardrailResult> => {
  const verdict = await classifyGrounding(ctx);

  if (!verdict.locatable) {
    const detail =
      verdict.unlocatable_detail.trim().length > 0
        ? verdict.unlocatable_detail.trim()
        : "The feedback references something that does not appear in the source.";
    return {
      pass: false,
      blocked: true,
      reason: detail,
      flagged: [{ reason: "unlocatable", detail }],
    };
  }

  return { ...PASS };
};

/**
 * G3 — Grounding guard (PRE).
 *
 * Blocks before regeneration when the feedback asks to add a claim the
 * transcript does not support, so the engine cannot fabricate it.
 *
 * Override fork: a logged `override=true` path may intentionally allow
 * ungrounded additions. Override is OFF by default; when `ctx.override === true`
 * the block is skipped. No override UI is built here.
 */
export const groundingGuard: PreGuardrailStage = async (
  ctx: GuardrailContext,
): Promise<GuardrailResult> => {
  const verdict = await classifyGrounding(ctx);

  if (!verdict.grounded && ctx.override !== true) {
    const detail =
      verdict.ungrounded_detail.trim().length > 0
        ? verdict.ungrounded_detail.trim()
        : "The feedback asks to add a claim that the transcript does not support.";
    return {
      pass: false,
      blocked: true,
      reason: detail,
      flagged: [{ reason: "ungrounded", detail }],
    };
  }

  return { ...PASS };
};
