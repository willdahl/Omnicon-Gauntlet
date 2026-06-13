# OMNICON - Meeting-Context Harness — V1: Human-in-the-Loop Summary Review

*Architecture Overview & Defense · William Dahl · Gauntlet Hackathon · June 12, 2026*

## Overview & Core Problem

Note-takers (Granola, Teams) capture meetings but leave the output static: you cannot correct what a summary got wrong, and that drift compounds as the data flows into a knowledge base. The harness is an **agentic post-processor** that ingests a transcript and its summary, lets a human flag what matched and what didn't in one pass, and regenerates a corrected **V2 summary and V2 transcript** so downstream context reflects intent. Mental model: **agentic ETL** — close the gap between **raw** capture and **golden** (desired) output, with the human as the correctness signal. V1 scope is deliberately the single review loop; tagging/profiles (V2) and per-type templates with cross-meeting query (V3) build on it.

## Architecture — Components & Flow

**Pipeline:** Model picker → MCP source picker → conversation picker → ingest transcript + summary → single human-in-the-loop prompt ("what worked / what didn't") → guarded edit function emits scoped diffs → review & approve → write V2 summary + V2 transcript.

- **Tools —** select connected MCP sources for transcript/summary (Granola today; pluggable later); the loop queues one conversation per pass.
- **Loop —** a single review pass per conversation: ingest → collect one-shot human feedback → produce V2 artifacts. One conversation, one deterministic pass (not an open-ended agent loop) keeps it auditable.
- **Model layer —** GUI model selector decoupled from logic, so any available model (Claude, GPT, …) is swappable per run for cost/quality comparison.
- **Observability —** pane exposes reasoning, model used, tokens, cost, and latency per run — making refinements debuggable and per-model performance comparable.

## Key Decisions & Why (X over Y)

- **Live outside the capture tool.** Granola can't modify how it summarizes or tags; a separate harness owns correction and enrichment without being locked to one vendor.
- **Keep transcript and summary as separate artifacts.** Enables apples-to-apples comparison of summarization models against one transcript — the basis for future benchmarking.
- **Deterministic single pass over an autonomous agent (for V1).** A bounded ingest→review→write step is reviewable and cheap; full automation is deferred until correction data justifies trusting it.
- **Human-in-the-loop before any write.** The user is the golden-data signal; nothing persists without explicit approval, and correction volume becomes the eval metric over time.

## Guardrails

- **Scoped / minimal-diff —** only spans referenced by feedback may change. The edit function emits a **structured diff**; non-referenced text is validated byte-identical to source before write-back — turning "don't rewrite what I didn't ask" into a checked invariant.
- **Low-confidence flagging —** if feedback can't be mapped to a span, or maps below a confidence threshold, it is **flagged for the human** rather than silently applied.
- **Grounding —** every edited summary claim must trace to a transcript span; feedback cannot inject unsupported facts.
- **Approval + versioning —** V2 is never written silently — the diff is shown, approved, and V1 is retained, keeping the loop reversible and auditable.
- **Untrusted input:** transcripts are treated as data, not instructions, to contain prompt-injection from meeting content. Likewise, we should treat the feedback as solely pertaining to the transcript and summary – not to take other actions outside of that scope.

## Additional Considerations

- **Transcript/Summary Source Differences** – Transcript and Summary Sources may have different formats, speaker identification, etc. – which may require additional architectural considerations and transformation overhead
- **Language Differences + Identification** – Initial scope should be English only (guard-rail) – hinges on ability to detect English accurately
- **Text Size / Transcript Length vs. LLM Selection** – Will probably need to define context window limits per model and advise the user that they will to change or update the model to be able process longer-length transcripts – with some ultimate limitation or cutoff
- **Cost** – Pre-review benchmarking of associated cost – most likely a combination of the length of the transcript + summaries – together with the length + complexity of any modifications or feedback
