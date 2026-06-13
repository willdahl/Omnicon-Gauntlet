import { detect } from "tinyld";
import type { GuardrailContext, GuardrailResult, PreGuardrailStage } from "../types";
import { PASS } from "../types";

/**
 * Minimum number of alphabetic characters before we trust the language
 * detector. Near-empty, numeric, or symbol-only strings carry no language
 * signal, so we treat them as neutral (English) rather than risk a false
 * positive that blocks a legitimate request.
 */
const MIN_LETTERS_FOR_DETECTION = 3;

/** Friendly names for the languages we are most likely to encounter. */
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
};

function languageName(code: string): string {
  return LANGUAGE_NAMES[code] ?? code;
}

/**
 * Returns the detected non-English language code for `text`, or null when the
 * text is English, neutral (numeric / symbol-only / too short), or the detector
 * is not confident enough to make a call.
 *
 * Deterministic: backed by the pure-JS `tinyld` detector (NOT the LLM), so the
 * same input always yields the same verdict.
 */
export function detectNonEnglish(text: string): string | null {
  const cleaned = text.trim();
  if (cleaned.length === 0) return null;

  // Count actual letters across all scripts; ignore digits/punctuation/symbols.
  const letters = cleaned.replace(/[^\p{L}]/gu, "");
  if (letters.length < MIN_LETTERS_FOR_DETECTION) return null;

  const lang = detect(cleaned);
  // Empty string => detector had no confident guess; treat as neutral.
  if (!lang || lang === "en") return null;

  return lang;
}

/**
 * True when the text is English or carries no usable language signal. Returns
 * false only when the detector is reasonably confident the text is a
 * non-English natural language.
 */
export function isEnglish(text: string): boolean {
  return detectNonEnglish(text) === null;
}

/**
 * G5 — Language scope guard.
 *
 * Blocks the pipeline before regeneration when the source content
 * (`v1Summary`, optional `v1Transcript`) or the user `feedback` is confidently
 * detected as a non-English natural language. OMNICON only supports English.
 */
export const languageGuard: PreGuardrailStage = async (
  ctx: GuardrailContext,
): Promise<GuardrailResult> => {
  const sources: { label: string; text: string }[] = [
    { label: "Summary", text: ctx.v1Summary },
    { label: "Feedback", text: ctx.feedback },
  ];
  if (ctx.v1Transcript) {
    sources.push({ label: "Transcript", text: ctx.v1Transcript });
  }

  for (const { label, text } of sources) {
    const lang = detectNonEnglish(text);
    if (lang) {
      const name = languageName(lang);
      const reason = `${label} detected as ${name} (${lang}); only English is supported.`;
      return {
        pass: false,
        blocked: true,
        reason,
        flagged: [
          {
            reason: "unsupported_language",
            detail: reason,
          },
        ],
      };
    }
  }

  return { ...PASS };
};
