---
name: LLM long verbatim text output format
description: Why the regeneration engine uses sentinel delimiters instead of JSON for LLM output
---

When an LLM must return long, multi-line verbatim text (e.g. a full meeting
transcript), do NOT ask it to return that text inside a JSON object — use
sentinel delimiters and parse by string-splitting instead.

**Why:** With `response_format: { type: "json_object" }`, models (observed with
google/gemini-3.5-flash on a ~9.5k-char transcript) still emit literal
unescaped newlines inside long string values, producing invalid JSON that fails
`JSON.parse`. Delimiter sections (e.g. `<<<V2_TRANSCRIPT>>> ... <<<END_...>>>`)
sidestep all JSON escaping issues for large multi-line bodies.

**How to apply:** In the OMNICON regeneration engine
(`artifacts/api-server/src/lib/regenerate.ts`) the prompt asks for delimited
sections and parsing extracts text between markers. Short/structured fields can
still use JSON; reserve delimiters for the long verbatim payloads.
