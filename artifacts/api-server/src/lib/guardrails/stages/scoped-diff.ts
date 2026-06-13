import type { RegenerateOutput } from "../../regenerate";
import { computeLineDiff } from "../../diff";
import type { GuardrailContext, GuardrailResult, PostGuardrailStage } from "../types";
import { PASS } from "../types";

/**
 * G1 — Scoped / minimal-diff post-guard.
 *
 * Runs AFTER regeneration and verifies that a targeted correction changed only
 * the lines the feedback actually references, leaving every unrelated line
 * byte-identical. Example: "the owner is wrong — it should be Jordan" must touch
 * only the owner line; the kickoff date and budget lines stay untouched. The
 * adversarial twist ("…and make the whole thing punchier") must NOT slip
 * unrelated tone edits past this guard.
 *
 * Deterministic: a line-level diff (no LLM, no network) between `ctx.v1Summary`
 * and `output.v2Summary`. A line counts as "in scope" when it shares at least
 * one meaningful keyword with the feedback. Any changed line that shares no
 * feedback keyword is flagged as `out_of_scope`.
 *
 * Block vs. flag-only threshold (intentionally conservative for the demo):
 *   - FLAG-ONLY by default — a legitimate multi-line correction can touch
 *     several lines, so we never block merely because more than one line moved.
 *   - BLOCK only for an *egregiously* broad rewrite: a multi-line (>= 2 lines)
 *     summary where NONE of the original lines survived AND at least one of the
 *     replacement/removed lines is out of scope (i.e. a wholesale replacement
 *     with unrelated content). Single-line summaries are never blocked here,
 *     because a legitimate single-line edit (e.g. Monday -> Tuesday) replaces
 *     its only line by design.
 */

/**
 * Generic words that carry no topical signal. Includes the imperative verbs and
 * qualifiers feedback tends to use ("change", "fix", "make", "whole", "thing")
 * so an instruction like "make the whole thing punchier" reduces to its real
 * content word ("punchier") and cannot vacuously "justify" an unrelated line.
 */
const STOPWORDS = new Set<string>([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "to", "of", "in", "on", "at", "for", "and", "or", "but", "it", "its",
  "this", "that", "these", "those", "with", "as", "by", "from", "into",
  "should", "would", "could", "will", "shall", "can", "may", "might", "must",
  "do", "does", "did", "has", "have", "had", "not", "no",
  "i", "you", "he", "she", "we", "they", "me", "him", "her", "us", "them",
  "my", "your", "his", "their", "our",
  "please", "make", "change", "changed", "fix", "fixed", "update", "updated",
  "set", "wrong", "right", "correct", "incorrect", "instead", "actually",
  "whole", "thing", "things", "all", "every", "also", "too", "really", "just",
]);

/** Lowercased alphanumeric tokens, stopwords stripped. */
function keywords(text: string): Set<string> {
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const out = new Set<string>();
  for (const tok of tokens) {
    if (tok.length < 2) continue;
    if (STOPWORDS.has(tok)) continue;
    out.add(tok);
  }
  return out;
}

/** True when `line` shares at least one keyword with the feedback. */
function isInScope(line: string, feedbackKeywords: Set<string>): boolean {
  for (const kw of keywords(line)) {
    if (feedbackKeywords.has(kw)) return true;
  }
  return false;
}

export const scopedDiffGuard: PostGuardrailStage = async (
  ctx: GuardrailContext,
  output: RegenerateOutput,
): Promise<GuardrailResult> => {
  const feedbackKeywords = keywords(ctx.feedback);
  const segments = computeLineDiff(ctx.v1Summary, output.v2Summary);

  const v1LineCount = segments.filter((s) => s.type !== "add").length;
  const preservedCount = segments.filter((s) => s.type === "same").length;

  // Every line the diff actually touched (removed from v1 or added in v2).
  const changedLines = segments
    .filter((s) => s.type !== "same")
    .map((s) => s.value.trim())
    .filter((v) => v.length > 0);

  // A changed line is unexpected when it shares no keyword with the feedback.
  const outOfScopeLines = changedLines.filter(
    (line) => !isInScope(line, feedbackKeywords),
  );

  if (outOfScopeLines.length === 0) {
    // Healthy targeted edit (or no change at all). This is the G1 happy path.
    return { ...PASS };
  }

  // Wholesale replacement of a multi-line summary: nothing preserved + the new
  // content is unrelated to the feedback. This is the only case we hard-block.
  const wholesaleReplacement = v1LineCount >= 2 && preservedCount === 0;

  const detail =
    `Edit touched ${outOfScopeLines.length} line(s) the feedback does not reference: ` +
    outOfScopeLines.map((l) => `"${l}"`).join(", ") +
    `. Feedback: "${ctx.feedback.trim()}".`;

  return {
    pass: false,
    blocked: wholesaleReplacement,
    reason: wholesaleReplacement
      ? `Out-of-scope rewrite blocked: the V2 summary replaced unrelated content. ${detail}`
      : undefined,
    flagged: [
      {
        reason: "out_of_scope",
        detail,
      },
    ],
  };
};
