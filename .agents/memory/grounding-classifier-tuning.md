---
name: Grounding classifier tuning (G2/G3)
description: Two non-obvious gotchas when building OMNICON's LLM locatability/grounding classifier.
---
The shared semantic classifier behind G2 (locatability) and G3 (grounding) needed two non-obvious fixes.

## 1. Token budget vs. inline chain-of-thought
The resolved models (default `google/gemini-3.5-flash`) emit reasoning INLINE in `message.content` before the JSON verdict, even without `reasoning:{enabled:true}`. A tight `max_tokens` (e.g. 512) truncates the response mid-reasoning, so no JSON is ever emitted → `JSON.parse` throws → the fail-open default returns all-true → the guard silently never blocks (every case passed). Fix: `max_tokens: 4096` so the model finishes reasoning and still emits the small delimited verdict.
**Why it's a trap:** an all-true verdict is indistinguishable from a correct "everything is fine" verdict, so the guard *looks* wired up while doing nothing. Always confirm the classifier actually parses a verdict, not just that it returns `pass`.

## 2. Locatable vs. grounded must be split by EDIT INTENT, not by "does X exist"
The naive rubric ("does everything the feedback references exist?" for locatable; "is every addition supported?" for grounded) makes an ungrounded ADD (G3's "$1M") ALSO read as unlocatable (the $1M isn't in the source). Because locatability is registered before grounding and the pipeline short-circuits on first block, G3 then flags `unlocatable` instead of the expected `ungrounded`.
Fix: the prompt first classifies the edit as a CORRECTION/CHANGE/FIX/REMOVAL vs. an ADDITION. Locatability ONLY judges corrections (does the target-to-fix exist?); grounding ONLY judges additions (is the new claim supported?). A pure addition is left `locatable:true`; a pure correction is left `grounded:true`. This keeps the two reasons mutually exclusive so each fixture gets its own reason.
**How to apply:** if a future guard reorders pre-stages or the classifier starts double-flagging, re-check this intent split before touching pipeline order. Calibration target: only CLEAR fabrications block; ordinary English edits (G1, G4-A, G5-C) must stay unblocked.
