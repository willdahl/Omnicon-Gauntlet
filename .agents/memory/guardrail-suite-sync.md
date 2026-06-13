---
name: Guardrail test suite sync
description: The executable guardrail suite, its frontend display copy, and the spec doc must stay aligned.
---
The OMNICON guardrail demo suite lives in three places that must stay in sync:
- `artifacts/api-server/src/lib/guardrails/test-fixtures.ts` — the executable suite (fixtures, feedback, expected). Source of truth for what runs.
- `artifacts/omnicon/src/omnicon/guardrail-meta.ts` — a frontend-only DISPLAY copy (id, guardrail name, feedback, expected) so the test panel can render Input/Expected for pending rows before the SSE stream arrives. It deliberately duplicates the backend data to avoid importing backend deps into the Vite bundle.
- `attached_assets/guardrail_test_suite*.md` — the human spec; the suite mirrors its 8 cases: G1 scoped-diff, G2 unlocatable, G3 $1M grounding, G4-A injection-in-transcript (inert), G4-B injection-in-feedback (refused), G5-A French input, G5-B Spanish feedback, G5-C English control.

**Why:** the .ts duplication is intentional (bundle isolation). A case change applied to only one file makes the panel drift from what actually runs. `GuardrailPanel.tsx` also hardcodes the 8 ids in `ALL_CASE_IDS` and `total`.

**How to apply:** when adding/editing/removing a case, edit test-fixtures.ts AND guardrail-meta.ts together, and update `ALL_CASE_IDS`/`total` if the id set changes.

Two design notes:
- The spec's fixtures are summary-only for several cases (transcript: null). The regen engine is a single LLM call that always emits a V2 transcript, so summary-only fixtures get a minimal 1-line synthetic transcript grounded in the summary (only supplements the optional field; case semantics/feedback/expected match the spec exactly).
- Guardrails register via `guardrails/stages/index.ts` (`preStages`/`postStages` arrays) which `defaultPipelineConfig` consumes — each new guard adds one import line there to avoid merge conflicts. G5 (language scope) is built: `stages/language.ts` uses `tinyld` (deterministic, NON-LLM) to block confidently non-English summary/transcript/feedback. Remaining unbuilt guards (G2 unlocatable, G3 grounding, G4-B out_of_scope) still FAIL by design; the panel doubles as a "what still needs building" checklist. Currently passing: G1, G4-A (LLM regen alone), G5-A/B/C.

**Concurrency / SSE:** the suite runs all cases CONCURRENTLY (`Promise.all` over TEST_CASES in `runTestSuite`); each case streams its own running/result via `onProgress` out of completion order, but the returned array (used for the final `complete` event) preserves canonical order. Wall-clock dropped from ~94s serial to ~18s.
**Why:** the serial run held the SSE connection open ~90s, which the dev proxy dropped mid-stream → the panel showed "Error: network error" with all rows pending. Keep the suite parallel so a full run stays well under proxy connection limits. If a future change adds many more cases or hits OpenRouter rate limits, add a small concurrency pool rather than reverting to serial.
