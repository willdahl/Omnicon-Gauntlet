# OMNICON - Meeting-Context Harness — V1: Human-in-the-Loop Summary Review

*Architecture Overview & Defense · William Dahl · Gauntlet Hackathon · June 12, 2026*

> **Implementation status:** this document describes the product vision and the shipped V1 review loop together. Where the two diverge, this doc calls it out explicitly (see the Guardrails and Additional Considerations sections below, and `ARCHITECTURE.md` for full implementation detail). The most important divergence: **there is no live MCP/Granola/Teams ingestion in the running app.** The harness runs on a single hardcoded seed fixture (`artifacts/api-server/src/seed/index.ts`) — the source picker's Granola/Otter/Fireflies options are UI only and do not connect to anything.

## Overview & Core Problem

Note-takers (Granola, Teams) capture meetings but leave the output static: you cannot correct what a summary got wrong, and that drift compounds as the data flows into a knowledge base. The harness is envisioned as an **agentic post-processor** that ingests a transcript and its summary, lets a human flag what matched and what didn't in one pass, and regenerates a corrected **V2 summary and V2 transcript** so downstream context reflects intent. Mental model: **agentic ETL** — close the gap between **raw** capture and **golden** (desired) output, with the human as the correctness signal. V1 scope is deliberately the single review loop; tagging/profiles (V2) and per-type templates with cross-meeting query (V3) are roadmap, not built.

## Architecture — Components & Flow

**Pipeline:** Model picker → source picker → conversation picker → ingest transcript + summary → single human-in-the-loop prompt ("what worked / what didn't") → guarded edit function emits scoped diffs → review & approve → V2 summary + V2 transcript rendered for the session.

- **Tools —** the source picker UI names connected sources (Granola today; pluggable later) as the intended integration surface, but **no source is actually wired up** — every run today reviews the one hardcoded seed conversation.
- **Loop —** a single review pass per conversation: ingest → collect one-shot human feedback → produce V2 artifacts. One conversation, one deterministic pass (not an open-ended agent loop) keeps it auditable.
- **Model layer —** GUI model selector decoupled from logic, so any available model (Claude, GPT, …) is swappable per run for cost/quality comparison.
- **Observability —** pane exposes reasoning, model used, tokens, cost, and latency per run — making refinements debuggable and per-model performance comparable.

## Key Decisions & Why (X over Y)

- **Live outside the capture tool.** Granola can't modify how it summarizes or tags; a separate harness owns correction and enrichment without being locked to one vendor.
- **Keep transcript and summary as separate artifacts.** Enables apples-to-apples comparison of summarization models against one transcript — the basis for future benchmarking.
- **Deterministic single pass over an autonomous agent (for V1).** A bounded ingest→review→write step is reviewable and cheap; full automation is deferred until correction data justifies trusting it.
- **Human-in-the-loop before any write.** The user is the golden-data signal — no edit reaches V2 without explicit approval. (Approval today is a UI stage transition, not a write to storage; see Guardrails below.)

## Guardrails

Five guards run around every regeneration call (see `ARCHITECTURE.md` §4 for the full pipeline). What's actually shipped today:

- **Scoped / minimal-diff (G1) —** a keyword-overlap heuristic, not byte-identical validation. The post-generation diff is checked against the feedback's keywords; an out-of-scope changed line is **flagged**, not blocked, by default (a legitimate multi-line correction can touch several lines). It **hard-blocks only wholesale replacement** — a multi-line summary where nothing survived and the new content is unrelated to the feedback.
- **Grounding + locatability (G2/G3) —** a single shared LLM classifier call blocks a correction that targets something absent from the source, and blocks an addition that asserts a fact the transcript doesn't support.
- **Language scope (G5) —** non-English source content or feedback is detected (deterministically, via `tinyld`) and blocked before any LLM call.
- **Untrusted input (G4-A/G4-B) —** the transcript is treated as inert data, never instructions, both via prompt hardening and a post-generation leak check; feedback that itself reads as a prompt-injection or out-of-scope meta-instruction is refused before generation.

**Not shipped — roadmap:**

- **Low-confidence flagging.** The `FlagReason` type includes `"low_confidence"`, but no guard currently emits it — there is no confidence-scored partial-match flagging today.
- **Approval + versioning.** "Approve" is a UI stage transition (`setStage(6)`), not a write. There is no persistence: no V1/V2 history is stored anywhere, and nothing is retained once the session ends. A real versioning/persistence layer is future work.

## Additional Considerations

- **Transcript/Summary Source Differences** – Transcript and Summary Sources may have different formats, speaker identification, etc. – which may require additional architectural considerations and transformation overhead
- **Language Differences + Identification** – Initial scope should be English only (guard-rail) – hinges on ability to detect English accurately
- **Text Size / Transcript Length vs. LLM Selection** – Will probably need to define context window limits per model and advise the user that they will to change or update the model to be able process longer-length transcripts – with some ultimate limitation or cutoff
- **Cost** – Pre-review benchmarking of associated cost – most likely a combination of the length of the transcript + summaries – together with the length + complexity of any modifications or feedback
