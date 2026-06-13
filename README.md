# OMNICON — Meeting-Context Harness

### V1: Human-in-the-Loop Summary Review

_Architecture overview & defense · William Dahl · Gauntlet Hackathon · June 2026_

OMNICON is a human-in-the-loop **review harness** for AI meeting notes. It ingests a meeting transcript and its AI-generated summary (the "V1"), lets a reviewer flag in one pass what the summary got right and wrong, then calls a live LLM to regenerate a corrected **V2 summary and V2 transcript**. Every change is shown as a side-by-side diff with a plain-English justification, gated behind explicit human approval, and measured for cost, tokens, and latency.

---

## The Problem

Note-takers (Granola, Teams, etc.) capture meetings but leave the output **static**: you cannot correct what a summary got wrong, and that drift compounds as the data flows into a knowledge base. OMNICON is an **agentic post-processor** that closes the gap between **raw** capture and **golden** (desired) output — with the human as the correctness signal.

Mental model: **agentic ETL**. V1 scope is deliberately the single review loop; tagging/profiles (V2) and per-type templates with cross-meeting query (V3) build on it.

---

## What It Does — The Six-Stage Workflow

A single deterministic review pass per conversation, not an open-ended agent loop — which keeps it auditable.

| # | Stage | What happens |
|---|---|---|
| 1 | **Source** | Pick the meeting data source (and optionally load the guardrail test suite). |
| 2 | **Conversation** | Choose the meeting to review. |
| 3 | **Model** | Select the LLM — Fast vs. Powerful tiers across Claude, GPT, and Gemini. |
| 4 | **Review** | Read V1, give grounded feedback ("what matched / what didn't"). |
| 5 | **Diff** | Compare V1 vs V2 side-by-side and read the model's "what changed" explanation. |
| 6 | **Output** | Approve, then view full run observability and export. |

The model selector is decoupled from the logic, so any available model is swappable per run for cost/quality comparison. Nothing is written until the reviewer approves — V1 is always retained, keeping the loop reversible.

---

## Guardrails

Five guardrails run on **every** regeneration. Cheap deterministic checks run first and short-circuit before the costlier semantic (LLM) checks. G2 and G3 share a single classifier call per request.

| ID | Guardrail | What it enforces |
|---|---|---|
| **G1** | **Scoped Diff** | Blocks wholesale rewrites — only spans the feedback referenced may change; non-referenced text is validated against the source before write-back. |
| **G2** | **Locatability** | Rejects *corrections* to entities/facts that don't exist in the source, so the engine cannot invent a target to "fix." |
| **G3** | **Grounding** | Rejects *additions* the transcript doesn't support, so the engine cannot fabricate a new claim. |
| **G4** | **Injection** | Ignores "ignore previous instructions" embedded in transcripts (G4-A) and blocks meta-instructions in reviewer feedback (G4-B). |
| **G5** | **Language Scope** | Blocks non-English input (English-only scope). |

**G2 vs G3:** locatability covers the thing you're *changing* (does the target exist?); grounding covers the thing you're *adding* (is the new claim supported?). An ordinary correction like "the owner is wrong, it's Jordan" passes both.

**Untrusted input:** transcripts are treated as data, not instructions, to contain prompt-injection from meeting content. Reviewer feedback is likewise scoped solely to the transcript and summary — never to take actions outside of that.

---

## Observability

No black box: every regeneration is fully measured. The output stage exposes the model used, input/output/total tokens, estimated cost (USD), end-to-end latency, finish reason, and the model's chain-of-thought reasoning — making refinements debuggable and per-model performance comparable. The full run (summary, transcript, notes, logs) can be exported as JSON.

---

## Architecture at a Glance

A pnpm monorepo with four artifacts and a set of shared, code-generated contract libraries.

| Artifact | Kind | Directory | Purpose |
|---|---|---|---|
| **OMNICON** | web | `artifacts/omnicon` | React + Vite frontend — landing page + the six-stage review wizard |
| **API Server** | api | `artifacts/api-server` | Express backend — LLM orchestration, guardrails, diff engine, validation |
| **OMNICON Overview** | slides | `artifacts/omnicon-deck` | Project overview slide deck |
| **Canvas** | design | `artifacts/mockup-sandbox` | Design/prototyping tooling — not part of the product |

**Shared libraries** (`lib/`): `api-spec` (OpenAPI — the single source of truth), `api-zod` (server-side Zod schemas, codegen), `api-client-react` (typed React Query hooks, codegen), `integrations-openrouter-ai` (OpenRouter proxy client), `db` (Drizzle + Postgres).

**Request flow (one regeneration):** the frontend bootstraps from `GET /api/regenerate/seed`, the reviewer edits feedback and picks a model, then `POST /api/regenerate` runs the guardrail pipeline, calls the LLM via the Replit-managed OpenRouter proxy, parses V2 transcript/summary + change explanation, computes line diffs and stats, and returns it all with observability. Both ingress and egress are Zod-validated against the spec.

> For the full data-flow diagram, route contracts, adapter layer, and prompt/parsing details, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

---

## Running It

Requires Node.js 24 and pnpm.

```bash
pnpm install
pnpm --filter @workspace/api-server run dev   # API server
pnpm --filter @workspace/omnicon run dev       # web frontend
```

Useful workspace commands:

```bash
pnpm run typecheck                               # full typecheck across all packages
pnpm run build                                    # typecheck + build all packages
pnpm --filter @workspace/api-spec run codegen     # regenerate hooks + Zod schemas from the OpenAPI spec
pnpm --filter @workspace/db run push              # push DB schema (dev only)
```

Required env: `DATABASE_URL` (Postgres). The OpenRouter LLM access is provided through the Replit-managed integration proxy.

**Stack:** pnpm workspaces · TypeScript 5.9 · React + Vite · Express 5 · PostgreSQL + Drizzle ORM · Zod (`zod/v4`) · Orval (OpenAPI codegen).

---

## Key Decisions & Why

- **Live outside the capture tool.** Granola can't change how it summarizes or tags; a separate harness owns correction and enrichment without being locked to one vendor.
- **Keep transcript and summary as separate artifacts.** Enables apples-to-apples comparison of summarization models against one transcript — the basis for future benchmarking.
- **Deterministic single pass over an autonomous agent (for V1).** A bounded ingest → review → write step is reviewable and cheap; full automation is deferred until correction data justifies trusting it.
- **Human-in-the-loop before any write.** The reviewer is the golden-data signal; nothing persists without explicit approval, and correction volume becomes the eval metric over time.
- **OpenAPI as the single source of truth.** Server Zod validation and client React Query hooks are both generated from one spec, so the contract can never silently drift between frontend and backend.

---

## Additional Considerations

- **Transcript/summary source differences.** Sources vary in format, speaker identification, etc. — which may require additional transformation overhead.
- **Language detection.** Initial scope is English-only (G5), which hinges on detecting English accurately.
- **Transcript length vs. model selection.** Context-window limits per model mean long transcripts may require switching models, with an ultimate cutoff.
- **Cost.** Pre-review cost benchmarking — most likely a function of transcript + summary length combined with the length/complexity of the feedback.

---

## Roadmap

- **V1 (this build):** the single human-in-the-loop review loop — ingest, correct, diff, approve, observe.
- **V2:** tagging and reviewer profiles built on accumulated correction data.
- **V3:** per-meeting-type templates with cross-meeting query.
