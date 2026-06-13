---
name: OMNICON regeneration engine wiring
description: How the OMNICON web app consumes the api-server regeneration engine, and the data-contract decisions behind it.
---

# OMNICON ↔ regeneration engine contract

The engine (api-server) is the single source of truth for meeting content. The
web app holds **no** static transcript/summary/feedback/model data — it fetches
everything from the engine and only adapts the shapes for display.

- `GET /regenerate/seed` → default transcript/summary/feedback + model registry +
  defaultModel. Frontend seeds its model/feedback state from this.
- `POST /regenerate` → V2 transcript/summary, a free-form changeExplanation,
  **flat line-based** diffs (DiffSegment[] of same/add/remove), per-target
  diff stats, and observability (tokens, latency, cost(nullable), finishReason,
  reasoning(nullable)).

**Why:** keeps a clean separation — the engine owns content + telemetry, the UI
owns presentation. Avoids drift between two copies of the seed data.

**How to apply:** all transforms live in `artifacts/omnicon/src/omnicon/adapters.ts`.
The engine returns markdown summaries and plain `Speaker: text` transcripts, so
the UI must parse them (sections/segments) and convert the flat diff into
side-by-side pairs. If the engine response shape changes, update adapters there,
not the screen components (which are pure prop-driven views).

- omnicon is served at previewPath `/`, so the generated client's root-relative
  `/api/...` URLs resolve correctly with no `setBaseUrl` call.
- The Replit dev proxy aborts requests at ~120s. Slow models (e.g. Claude
  Sonnet) on the sample transcript exceed that and 502 before completing, so the
  engine default is `google/gemini-3.5-flash` (~31s) to keep the synchronous
  request under the proxy window. A proper long-run fix would need async/streaming.
