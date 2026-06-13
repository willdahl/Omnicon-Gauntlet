# OMNICON Architecture

OMNICON is a human-in-the-loop meeting-intelligence tool. A user feeds it a V1 meeting transcript and summary (from Granola, Teams, or any source), reviews what the AI got right or wrong, and submits feedback. OMNICON calls a real LLM to produce a corrected V2 transcript and a regenerated V2 summary, then shows a side-by-side diff so the user can approve or reject before committing the output.

---

## Table of Contents

1. [System Overview & Data-Flow Diagram](#1-system-overview--data-flow-diagram)
2. [Frontend Workflow — Six-Stage State Machine](#2-frontend-workflow--six-stage-state-machine)
3. [Adapter Layer](#3-adapter-layer)
4. [API Contract](#4-api-contract)
5. [LLM Prompt & Parsing](#5-llm-prompt--parsing)
6. [Backend Support Functions](#6-backend-support-functions)

---

## 1. System Overview & Data-Flow Diagram

### Three-Artifact Structure

| Artifact | Kind | Directory | Preview Path | Purpose |
|---|---|---|---|---|
| OMNICON | web | `artifacts/omnicon` | `/` | React + Vite frontend — the six-stage user wizard |
| API Server | api | `artifacts/api-server` | `/api` | Express backend — LLM orchestration, diff engine, validation |
| Canvas | design | `artifacts/mockup-sandbox` | `/__mockup` | Design tooling only — not part of the product |

The API server's entry point (`artifacts/api-server/src/index.ts` lines 1–25) reads `PORT` from the environment and calls `app.listen`. All routes are mounted under `/api` in `artifacts/api-server/src/app.ts` (line 32):

```typescript
app.use("/api", router);
```

### Shared Library Packages

| Package | Path | Role |
|---|---|---|
| `@workspace/api-spec` | `lib/api-spec` | Single source of truth: `openapi.yaml` + Orval config |
| `@workspace/api-zod` | `lib/api-zod` | Zod schemas auto-generated from the spec; used by the server for validation |
| `@workspace/api-client-react` | `lib/api-client-react` | Typed React Query hooks + `customFetch` transport; used by the frontend |
| `@workspace/integrations-openrouter-ai` | `lib/integrations-openrouter-ai` | Thin wrapper instantiating an OpenAI-compatible client pointed at the Replit-managed OpenRouter proxy (`lib/integrations-openrouter-ai/src/client.ts` lines 15–18) |

### End-to-End Data-Flow: One Regeneration Request

```
Browser (artifacts/omnicon)
│
│  1. On mount: useGetRegenerateSeed()
│     GET /api/regenerate/seed
│     ← { meetingTitle, date, participants, v1Transcript, v1Summary,
│          feedback, models, defaultModel }
│
│  2. User navigates stages 1 → 4, edits feedback, picks a model.
│
│  3. Stage 4 "Generate" button fires handleGenerate()
│     POST /api/regenerate
│     → { v1Transcript, v1Summary, feedback, model }
│
│                 artifacts/api-server/src/routes/regenerate.ts
│                 │
│                 │  a. RegenerateBody.safeParse(req.body)      [line 33]
│                 │  b. isKnownModel(body.model) guard           [line 46]
│                 │  c. regenerate(body) ──────────────────────────────────┐
│                 │                                                         │
│                 │         artifacts/api-server/src/lib/regenerate.ts     │
│                 │         │                                               │
│                 │         │  buildPrompt(input)        [lines 50–90]     │
│                 │         │  openrouter.chat.completions.create(…)        │
│                 │         │    max_tokens: 8192                           │
│                 │         │    reasoning: { enabled: true }               │
│                 │         │    timeout: 180 000 ms                        │
│                 │         │    maxRetries: 1                              │
│                 │         │                                               │
│                 │       OpenRouter AI proxy (Replit-managed) ─────────────┘
│                 │                                                         │
│                 │         extractBetween() × 3       [lines 92–103]      │
│                 │         → v2Transcript, v2Summary, changeExplanation   │
│                 │                                                         │
│                 │  d. computeLineDiff(v1Transcript, v2Transcript) [diff.ts line 23]
│                 │     computeLineDiff(v1Summary, v2Summary)
│                 │  e. diffStats() × 2                           [diff.ts line 78]
│                 │  f. estimateCostUsd()              [models.ts line 76]
│                 │  g. RegenerateResponse.parse(payload)  [api-zod line 74]
│                 │
│     ← { v2Transcript, v2Summary, changeExplanation,
│          transcriptDiff, summaryDiff,
│          transcriptDiffStats, summaryDiffStats,
│          observability }
│
│  4. onSuccess → setResult(res) → setStage(5)    [DiffReview]
│  5. User approves  → setStage(6)                [OutputObservability]
│     User rejects   → setStage(4)                [ReviewWorkspace, re-edit]
```

---

## 2. Frontend Workflow — Six-Stage State Machine

**File:** `artifacts/omnicon/src/App.tsx`

The entire wizard lives in a single `App` component. Stage is an integer in `useState(1)` (line 103). All hooks run unconditionally (React rules); derived view models are `useMemo`-guarded.

### State Variables

| Variable | Type | Declaration | Purpose |
|---|---|---|---|
| `stage` | `number` (1–6) | line 103 | Active screen |
| `modelId` | `string \| null` | line 104 | Selected model; defaults to `seed.defaultModel` |
| `feedback` | `string \| null` | line 105 | User review text; defaults to `seed.feedback` |
| `result` | `RegenerateResult \| null` | line 106 | Full API response once generation succeeds |

`RegenerateResult` is imported from `@workspace/api-client-react` (line 6).

### Seed Bootstrap

`useGetRegenerateSeed()` (line 99) fires on mount. A `useEffect` (lines 109–113) sets `modelId` and `feedback` defaults — only if not already set — via `(cur) => cur ?? seed.defaultModel`.

`useRegenerate()` (line 100) is the mutation hook for `POST /api/regenerate`.

### Derived View Models

All are computed via `useMemo`; they run unconditionally to satisfy React's rules of hooks.

| Variable | Lines | Adapter Call | Used In Stage |
|---|---|---|---|
| `groups` | 116–119 | `modelsToGroups(seed.models, seed.defaultModel)` | 3 — `ModelPicker` |
| `meeting` | 120 | `seedToMeeting(seed)` | 2 — `ConversationPicker` |
| `v1Sections` | 121–124 | `parseSummarySections(seed.v1Summary)` | 4 — `ReviewWorkspace` |
| `v1Segments` | 125–128 | `parseTranscriptSegments(seed.v1Transcript)` | 4 — `ReviewWorkspace` |
| `derived` | 129–143 | multiple adapters on `result` | 5 & 6 |

`derived` (lines 129–143) is `null` until a result exists. It packages: `summaryPairs`, `transcriptPairs`, `summaryStats`, `transcriptStats`, `changes`, `v2Sections`, `v2Segments`. Stages 5 and 6 guard against a missing `derived` (lines 211–214) — if reached without one, they fall back to stage 4 with a loading screen.

### Stage Table

| Stage | Component | Key Props Received | Transition Trigger |
|---|---|---|---|
| 1 | `SourcePicker` | `onContinue`, `onStepClick` | "Continue" → `setStage(2)` (line 221) |
| 2 | `ConversationPicker` | `meetings`, `selectedId`, `onSelect`, `onContinue`, `onStepClick` | "Continue" → `setStage(3)` (line 231) |
| 3 | `ModelPicker` | `groups`, `advisory`, `selectedId`, `onSelect`, `onContinue`, `onStepClick` | "Continue" → `setStage(4)` (line 242) |
| 4 | `ReviewWorkspace` | transcript, summary, feedback, model info, `onFeedbackChange`, `onGenerate`, `generateError`, `onStepClick` | "Generate" → `handleGenerate()` (line 255) |
| 5 | `DiffReview` | summary/transcript diff pairs + stats, change bullets, `onApprove`, `onReject`, `onStepClick` | Approve → `setStage(6)` (line 271), Reject → `setStage(4)` (line 272) |
| 6 | `OutputObservability` | final V2 sections/segments, metrics, runMeta, `onStartNew`, `onStepClick` | "Start new" → `reset()` (line 297) |

`onStepClick` (lines 168–170): `if (step <= stage) setStage(step)` — backward navigation only.

`reset()` (lines 172–178): resets all four state variables to seed defaults and calls `regen.reset()` to clear the mutation state.

### `handleGenerate()` — lines 180–197

```typescript
// artifacts/omnicon/src/App.tsx lines 180–197
regen.mutate(
  { data: { v1Transcript: seed.v1Transcript, v1Summary: seed.v1Summary,
            feedback: effFeedback, model: effModelId } },
  { onSuccess: (res) => { setResult(res); setStage(5); } }
);
```

While `regen.isPending` is true (lines 200–208), the entire wizard is replaced by a `StatusScreen` loading spinner so the user cannot interact during generation (which can take up to ~2 minutes for large models).

### `describeRegenError(error, modelName)` — lines 69–96

Translates raw HTTP/network errors into user-friendly strings. Resolution order:

1. **Timeout** — `status` is 502/503/504, or body text matches `/bad gateway|gateway time-?out|couldn.?t reach this app/i` → tells the user the model exceeded the ~2-minute Replit proxy limit and suggests Gemini 3.5 Flash.
2. **Structured API error** — `err.data.error` string present → surfaced verbatim.
3. **Network failure** — message matches `/failed to fetch|networkerror|load failed|aborted/i` → similar timeout guidance.
4. **Fallback** — `err.message` or `"Generation failed. Please try again."`.

---

## 3. Adapter Layer

**File:** `artifacts/omnicon/src/omnicon/adapters.ts`

Adapters are pure functions with no side effects. They transform the raw API response shapes and seed fixture into the structured view-model types consumed by each screen. Types imported from `@workspace/api-client-react` (lines 6–11) and from `./mockData` (lines 12–21).

---

### `initialsOf(name: string): string` — lines 32–38

Strips parenthetical suffixes (e.g., `"(Speaker A)"`), splits on whitespace. Single-word name → first two characters uppercased. Multi-word name → first letter of first word + first letter of last word, uppercased.

**Why:** Speaker avatar badges in the transcript viewer need short, consistent initials regardless of name format (e.g., `"William Dahl (Speaker A)"` → `"WD"`).

---

### `wordCount(text: string): number` — lines 40–42

Trims, splits on `/\s+/`, filters empty tokens.

**Why:** The `ReviewWorkspace` header shows transcript word count as context before the user submits feedback. Also called by `seedToMeeting` (line 251) for the conversation card.

---

### `parseSummarySections(md: string): SummarySection[]` — lines 47–71

**Input:** A markdown summary string with `#`/`###` headings and `-` bullets.  
**Output:** `SummarySection[]` — `{ heading: string; bullets: string[] }[]` (type defined in `./mockData`).

Parses line-by-line:
- Heading line (`/^#{1,6}\s+/`) — closes the previous section and opens a new one (heading text is the captured group, trimmed).
- Bullet/text line — stripped of its list marker (`[-*•]`) and appended to `current.bullets`.
- Lines before the first heading go under an implicit `"Summary"` heading (line 65).
- Nested bullets are flattened (single array per section).
- Blank lines are skipped (line 54).

**Why:** Converts LLM-produced markdown into a structured array so `ReviewWorkspace` and `OutputObservability` can render each section as a titled card.

---

### `parseTranscriptSegments(text: string): TranscriptSegment[]` — lines 76–107

**Input:** A plain-text transcript string with a metadata header and a `Transcript:` marker.  
**Output:** `TranscriptSegment[]` — `{ id: string; speaker: string; initials: string; t: string; text: string }[]`.

1. Finds the `Transcript:` marker via `/^\s*transcript\s*:/i` (line 78); body is everything after.
2. For each body line: speaker pattern `/^([A-Za-z][\w .'\-]{0,40}?):\s*(.*)/` (line 88) → new segment. Unknown-speaker lines matching `HEADER_LABELS` (`"meeting title"`, `"date"`, `"participants"`, `"attendees"`, `"title"`) are skipped (lines 91–92, `HEADER_LABELS` defined lines 23–30).
3. Continuation lines (no speaker match) append to the previous segment's `text` (lines 100–103).
4. Segment IDs are `"seg-1"`, `"seg-2"`, … (counter incremented on each new segment, line 92).

**Why:** Converts a flat transcript string into speaker-attributed segments for the scrollable transcript viewer.

---

### `flatDiffToPairs(segments: DiffSegment[]): DiffPair[]` — lines 112–148

**Input:** `DiffSegment[]` — the engine's ordered flat diff (`{ type: "same" | "add" | "remove"; value: string }[]`).  
**Output:** `DiffPair[]` — `{ left: { op, text } | null; right: { op, text } | null }[]`.

Algorithm:
- Consecutive `"remove"` lines accumulate in `removeBuf`; consecutive `"add"` lines in `addBuf`.
- A `"same"` segment (or end of input) triggers `flush()`: buffers are zipped column-by-column (shorter side emits `null`).
- Blank-value segments (whitespace-only `value`) are skipped (line 131) to suppress markdown spacing noise.

**Why:** The `DiffReview` table needs two columns (V1 left, V2 right) with changed lines aligned side-by-side, not stacked. Raw `DiffSegment[]` is a linear stream; this converts it to parallel pairs.

---

### `mapStats(stats: { added, removed, unchanged }): DiffTargetStats` — lines 150–159

**Input:** `{ added: number; removed: number; unchanged: number }` (API shape).  
**Output:** `DiffTargetStats` — `{ additions: number; removals: number; unchanged: number }` (view-model shape, type in `./mockData`).

Renames `added → additions` and `removed → removals`.

**Why:** The API response uses `added`/`removed`; the UI type vocabulary uses `additions`/`removals`. The adapter decouples the two naming conventions.

---

### `explanationToBullets(text: string): string[]` — lines 163–172

**Input:** The LLM's free-form change explanation (may be a paragraph or a list).  
**Output:** `string[]` — one entry per bullet/line, list markers stripped.

Splits on `\n`, trims, strips `[-*•]` or `1.)` prefixes (line 169), filters blanks. If the result is empty, returns `[text.trim()]` as a single-item fallback (line 171).

**Why:** `DiffReview` and `OutputObservability` render this as a bullet list; the LLM may return either a plain paragraph or a formatted list.

---

### `observabilityToMetrics(obs: Observability, modelLabel: string, provider?: string): ObsMetric[]` — lines 174–210

**Input:** `Observability` object (from `@workspace/api-client-react`), plus display-friendly model label and optional provider string.  
**Output:** `ObsMetric[]` — `{ label: string; value: string; sub?: string }[]` (type in `./mockData`).

Produces six metric cards:

| Label | Value expression | Sub |
|---|---|---|
| Model | `modelLabel` | `provider?.toLowerCase()` |
| Input tokens | `obs.inputTokens.toLocaleString()` | `"prompt"` |
| Output tokens | `obs.outputTokens.toLocaleString()` | `"completion"` |
| Cost | `$${obs.estimatedCostUsd.toFixed(4)}` or `"—"` | `"estimated"` or `"pricing unavailable"` |
| Latency | `${(obs.latencyMs / 1000).toFixed(1)}s` | `"end to end"` |
| Total tokens | `obs.totalTokens.toLocaleString()` | `"in + out"` |

**Why:** `OutputObservability` renders a metrics grid; this adapter converts the raw numeric `Observability` into display-ready strings.

---

### `modelsToGroups(models: ModelInfo[], defaultModel: string): ModelProviderGroup[]` — lines 212–236

**Input:** `ModelInfo[]` (from `@workspace/api-client-react`) and the default model ID string.  
**Output:** `ModelProviderGroup[]` — `{ provider: string; models: ModelOption[] }[]` (types in `./mockData`).

Groups models by `provider` in insertion order (using a `Map` and a separate `order` array). Marks the model matching `defaultModel` as `recommended: true` on the `ModelOption`.

**Why:** `ModelPicker` renders models in provider-grouped sections (Anthropic, OpenAI, Google). Provider order matches the registry declaration order in `artifacts/api-server/src/lib/models.ts`.

---

### `seedToMeeting(seed: SeedResponse): MeetingSummaryItem` — lines 239–254

**Input:** `SeedResponse` (from `@workspace/api-client-react`).  
**Output:** `MeetingSummaryItem` — `{ id, title, date, platform, attendees, folder, segmentCount, wordCount, preview, selected }` (type in `./mockData`).

Calls `parseTranscriptSegments(seed.v1Transcript)` (line 240) to get segment count, and `parseSummarySections(seed.v1Summary)[0]?.bullets[0]` (line 241) to extract the first bullet as a preview string. Uses `wordCount(seed.v1Transcript)` (line 250) for the word count field. Hard-codes `platform: "Granola"`, `folder: "Imported"`, `id: "seed"` (lines 244–248).

**Why:** `ConversationPicker` expects an array of meeting card objects. The seed fixture provides only raw strings; this adapter produces the structured card.

---

## 4. API Contract

**Source of truth:** `lib/api-spec/openapi.yaml`  
**Zod validation layer (server-side):** `lib/api-zod/src/generated/api.ts` — auto-generated by Orval v8.9.1  
**React Query hooks (client-side):** `lib/api-client-react/src/generated/api.ts` — auto-generated by Orval v8.9.1  
**Orval config:** `lib/api-spec/orval.config.ts`

All routes are mounted under `/api` via `app.use("/api", router)` (`artifacts/api-server/src/app.ts` line 32). The router is assembled in `artifacts/api-server/src/routes/index.ts` (lines 1–10) by composing `healthRouter` and `regenerateRouter`.

---

### `GET /api/healthz`

**Handler:** `artifacts/api-server/src/routes/health.ts` lines 6–9  
**OpenAPI schema name:** `HealthStatus` (`lib/api-spec/openapi.yaml` lines 96–102)  
**Zod exported name:** `HealthCheckResponse` (`lib/api-zod/src/generated/api.ts` line 15) — named after the operationId `healthCheck`  
**React Query hook:** `healthCheck()` / `useHealthCheck()` (`lib/api-client-react/src/generated/api.ts`)

Returns `{ status: "ok" }`. The response is Zod-validated before being sent: `HealthCheckResponse.parse({ status: "ok" })` (health.ts line 7).

---

### `GET /api/regenerate/seed`

**Handler:** `artifacts/api-server/src/routes/regenerate.ts` lines 15–26  
**OpenAPI schema:** `SeedResponse` (`lib/api-spec/openapi.yaml` lines 127–158)  
**Zod exported name:** `GetRegenerateSeedResponse` (`lib/api-zod/src/generated/api.ts` line 25)  
**React Query hook:** `useGetRegenerateSeed()` (`lib/api-client-react/src/generated/api.ts`; imported in `App.tsx` line 4)

Returns the canonical seed fixture plus the full model registry. Used to bootstrap the UI on first load.

**Response shape:**

```
meetingTitle: string       — e.g. "Gauntlet Project"
date: string               — e.g. "2026-06-12"
participants: string[]     — e.g. ["William Dahl (Speaker A)", ...]
v1Transcript: string       — full plain-text transcript
v1Summary: string          — full markdown summary
feedback: string           — pre-filled sample review feedback
models: ModelInfo[]        — full list of available models
defaultModel: string       — ID of the recommended default model
```

`ModelInfo`: `{ id: string; label: string; provider: string }` (`lib/api-spec/openapi.yaml` lines 103–114; `lib/api-zod/src/generated/types/modelInfo.ts`).

---

### `GET /api/regenerate/models`

**Handler:** `artifacts/api-server/src/routes/regenerate.ts` lines 28–30  
**OpenAPI schema:** `ModelsResponse` (`lib/api-spec/openapi.yaml` lines 115–126)  
**Zod exported name:** `GetRegenerateModelsResponse` (`lib/api-zod/src/generated/api.ts` line 45)  
**React Query hook:** `useGetRegenerateModels()`

Returns `{ models: ModelInfo[]; defaultModel: string }`. A lighter alternative to the seed endpoint when only the model list is needed.

---

### `POST /api/regenerate`

**Handler:** `artifacts/api-server/src/routes/regenerate.ts` lines 32–98  
**Request OpenAPI schema:** `RegenerateRequest` (`lib/api-spec/openapi.yaml` lines 159–182)  
**Request Zod schema:** `RegenerateBody` (`lib/api-zod/src/generated/api.ts` line 66)  
**Response OpenAPI schema:** `RegenerateResult` (`lib/api-spec/openapi.yaml` lines 237–268)  
**Response Zod schema:** `RegenerateResponse` (`lib/api-zod/src/generated/api.ts` line 74)  
**Error schema:** `ErrorResponse` (`lib/api-spec/openapi.yaml` lines 269–278) — `{ error: string; retryable: boolean }`  
**React Query hook:** `useRegenerate()` (mutation; imported in `App.tsx` line 5)

**Request body:**

```
v1Transcript: string     — minLength: 1 — original transcript
v1Summary: string        — minLength: 1 — original AI summary
feedback: string         — minLength: 1 — user's review notes
flaggedSegments?: string[] — optional specific segments to highlight
model: string            — minLength: 1 — OpenRouter model ID
```

**Response body (200):**

```
v2Transcript: string           — LLM-corrected transcript
v2Summary: string              — LLM-regenerated markdown summary
changeExplanation: string      — plain-English description of changes
transcriptDiff: DiffSegment[]  — line diff: V1 vs V2 transcript
summaryDiff: DiffSegment[]     — line diff: V1 vs V2 summary
transcriptDiffStats: DiffStats
summaryDiffStats: DiffStats
observability: Observability
```

`DiffSegment` (`lib/api-spec/openapi.yaml` lines 183–193): `{ type: "same" | "add" | "remove"; value: string }`  
`DiffStats` (`lib/api-spec/openapi.yaml` lines 194–206): `{ added: number; removed: number; unchanged: number }`  
`Observability` (`lib/api-spec/openapi.yaml` lines 207–236): `{ model: string; inputTokens: number; outputTokens: number; totalTokens: number; latencyMs: number; estimatedCostUsd: number|null; finishReason: string; reasoning: string|null }`

**Error responses:**
- `400` — Zod validation failure or unknown model ID. `retryable: false`.
- `502` — LLM call failed or returned unusable output. `retryable: true` (or `false` for programmer errors).

### Route Handler Validation Chain

```
artifacts/api-server/src/routes/regenerate.ts

1. RegenerateBody.safeParse(req.body)              [line 33]
   → fail: 400 { error: "Invalid request: ...", retryable: false }

2. isKnownModel(body.model)                        [line 46]
   → fail: 400 { error: "Unknown model ...", retryable: false }

3. regenerate({ v1Transcript, v1Summary, feedback, flaggedSegments, model })   [line 57]
   → RegenerationError: 502 { error: err.message, retryable: err.retryable }
   → unexpected Error: 502 { error: "Unexpected error: ...", retryable: true }

4. computeLineDiff(v1Transcript, v2Transcript)      [lines 65–66]
   computeLineDiff(v1Summary, v2Summary)             [line 69]
   diffStats(transcriptDiff)                         [line 77]
   diffStats(summaryDiff)                            [line 78]

5. RegenerateResponse.parse(payload)               [line 83]   ← egress validation
   → ZodError caught as unexpected 502

6. res.json(validated)                             [line 84]
```

Both ingress (`RegenerateBody`) and egress (`RegenerateResponse`) are Zod-validated, ensuring the route never returns a shape that diverges from the OpenAPI spec.

### Shared Library Code-Generation Chain

```
lib/api-spec/openapi.yaml         ← edit here only
       │
       └─ Orval (lib/api-spec/orval.config.ts)
              │
              ├──► lib/api-zod/src/generated/api.ts
              │      RegenerateBody, RegenerateResponse,
              │      GetRegenerateSeedResponse, HealthCheckResponse, …
              │      (Zod schemas — used by the API server)
              │
              └──► lib/api-client-react/src/generated/api.ts
                     useGetRegenerateSeed, useRegenerate,
                     useGetRegenerateModels, useHealthCheck, …
                     (React Query hooks — used by the frontend)
```

`customFetch` (`lib/api-client-react/src/custom-fetch.ts`) is the transport used by all generated hooks. Key behaviours:
- Optional `baseUrl` prefix via `setBaseUrl()` (line 28) — used by mobile/Expo targets.
- Optional bearer token injection via `setAuthTokenGetter()` (line 43).
- Auto-sets `Content-Type: application/json` for JSON bodies (lines 341–344).
- BOM stripping (`stripBom`, line 128) and media-type-aware response parsing (`inferResponseType`, line 285).
- Throws `ApiError` (line 174) for non-2xx responses — carries `status`, `statusText`, `data`, `headers`, `response`, `method`, `url`.

---

## 5. LLM Prompt & Parsing

**File:** `artifacts/api-server/src/lib/regenerate.ts`

### Sentinel Delimiter Constants — lines 43–48

```typescript
const T_OPEN  = "<<<V2_TRANSCRIPT>>>";
const T_CLOSE = "<<<END_V2_TRANSCRIPT>>>";
const S_OPEN  = "<<<V2_SUMMARY>>>";
const S_CLOSE = "<<<END_V2_SUMMARY>>>";
const E_OPEN  = "<<<CHANGE_EXPLANATION>>>";
const E_CLOSE = "<<<END_CHANGE_EXPLANATION>>>";
```

The `<<<` / `>>>` delimiters are chosen because they are highly unlikely to appear in meeting transcripts or markdown summaries, making false positives from content nearly impossible.

---

### `buildPrompt(input: RegenerateInput): string` — lines 50–90

The function returns the complete user-turn message sent to the LLM. Below is the **verbatim template** (interpolation variables shown in `${…}` notation; the `${flagged}` token is an empty string when `input.flaggedSegments` is absent or empty, or the optional flagged-segments block otherwise):

```
You are the regeneration engine for OMNICON, a human-in-the-loop meeting-intelligence tool.

You are given:
1. A V1 meeting TRANSCRIPT.
2. A V1 SUMMARY generated from that transcript.
3. The user's REVIEW FEEDBACK, structured as "what matched (leave unchanged)" and "what didn't match (please correct)", with each correction grounded in a transcript quote.

Your job:
- Produce a corrected V2 TRANSCRIPT that honors the feedback. Only change what the feedback asks for (e.g. fixing speaker labels, attendee lists, or clear transcription issues the feedback identifies). Preserve everything else verbatim. Do NOT invent content that is not supported by the original transcript.
- Regenerate the V2 SUMMARY *from the corrected V2 transcript*, incorporating every "what didn't match" correction and preserving every "what matched" item. Keep the original summary's overall structure/headings where sensible.
- Write a plain-English CHANGE EXPLANATION describing what you changed and why, referencing the specific feedback points. Be concrete and concise.

Output format — emit each section between its exact delimiters, in this order, and NOTHING else (no markdown code fences, no commentary outside the delimiters). The content between delimiters may span multiple lines:

<<<V2_TRANSCRIPT>>>
(full corrected V2 transcript here)
<<<END_V2_TRANSCRIPT>>>
<<<V2_SUMMARY>>>
(full regenerated V2 summary here, markdown allowed)
<<<END_V2_SUMMARY>>>
<<<CHANGE_EXPLANATION>>>
(plain-English explanation of what changed and why)
<<<END_CHANGE_EXPLANATION>>>

=== V1 TRANSCRIPT ===
${input.v1Transcript}

=== V1 SUMMARY ===
${input.v1Summary}

=== REVIEW FEEDBACK ===
${input.feedback}${flagged}
```

**Optional flagged-segments block** (appended when `input.flaggedSegments` is non-empty, lines 52–55):

```
\n\nThe user also flagged these specific segments for attention:\n1. <seg1>\n2. <seg2>…
```

#### Clause Annotations

| Clause | Lines | Purpose |
|---|---|---|
| Role declaration | 58 | Establishes system context and persona. No separate system message — embedded in the user turn for maximum OpenRouter/provider compatibility. |
| Three-inputs enumeration | 61–63 | Names the three data sections that follow. "Grounded in a transcript quote" instruction discourages hallucination. |
| Transcript task | 66 | Minimal-edit constraint: "Only change what the feedback asks for" and "Do NOT invent content" are explicit hallucination guards. |
| Summary task | 67 | Source is the corrected V2 transcript (not V1 directly), ensuring internal consistency. Structure-preservation reduces unnecessary reformatting. |
| Explanation task | 68 | Anchors the explanation to the user's own feedback points. "Be concrete and concise" limits verbosity. |
| Output format rules | 70 | Three constraints: (a) "exact delimiters" — prevents paraphrasing sentinel strings; (b) "in this order" — deterministic parse order; (c) "NOTHING else" — prevents preamble/postamble breaking parsing. "may span multiple lines" explicitly permits multiline content. |
| Delimiter example | 72–80 | Uses the real sentinel constants so the model sees the exact strings it must emit. |
| Input sections | 82–89 | V1 Transcript, V1 Summary, Review Feedback — each clearly delimited with `===` headers. |

---

### `extractBetween(raw, open, close): string | null` — lines 92–103

```typescript
function extractBetween(raw: string, open: string, close: string): string | null {
  const start = raw.indexOf(open);
  if (start === -1) return null;
  const contentStart = start + open.length;
  const end = raw.indexOf(close, contentStart);
  const slice = end === -1 ? raw.slice(contentStart) : raw.slice(contentStart, end);
  return slice.replace(/^\n/, "").replace(/\n$/, "");
}
```

- `raw.indexOf(open)` — linear search for the first occurrence of the opening sentinel.
- `raw.indexOf(close, contentStart)` — searches for the closing sentinel after the opening, avoiding accidental matches.
- If `close` is not found: returns everything from after `open` to end-of-string (graceful partial recovery for truncated responses).
- `.replace(/^\n/, "")` — strips one leading newline (the newline the model emits after the opening delimiter before its content).
- `.replace(/\n$/, "")` — strips one trailing newline (before the closing delimiter).
- If `open` not found: returns `null`.

**Why linear search, not regex:** `indexOf` with an explicit `fromIndex` is unambiguous and handles the first occurrence correctly. A greedy regex could match across multiple delimiter pairs if the model emits the opening sentinel twice.

---

### Three-Field Validation Guard — lines 144–158

After `extractBetween` is called three times (lines 140–142), all three fields must be present and non-empty:

```typescript
if (
  v2Transcript    === null || v2Transcript.length    === 0 ||
  v2Summary       === null || v2Summary.length       === 0 ||
  changeExplanation === null || changeExplanation.length === 0
) {
  throw new RegenerationError(
    `LLM response missing required delimited sections (finish reason: ${
      choice.finish_reason ?? "unknown"
    }). The model may have been truncated or ignored the output format.`,
    true,
  );
}
```

A missing field typically means the model was truncated (`finish_reason: "length"`) or ignored the output format. The error is `retryable: true`.

---

### `regenerate(input: RegenerateInput): Promise<RegenerateOutput>` — lines 105–195

**Signatures:**

```typescript
// artifacts/api-server/src/lib/regenerate.ts lines 4–28
export interface RegenerateInput {
  v1Transcript: string;
  v1Summary: string;
  feedback: string;
  flaggedSegments?: string[];
  model: string;
}

export interface Observability {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  estimatedCostUsd: number | null;
  finishReason: string;
  reasoning: string | null;
}

export interface RegenerateOutput {
  v2Transcript: string;
  v2Summary: string;
  changeExplanation: string;
  observability: Observability;
}
```

**OpenRouter call parameters** (lines 113–123):

```typescript
openrouter.chat.completions.create(
  {
    model: input.model,
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
    reasoning: { enabled: true },   // OpenRouter extension — requests reasoning traces
  },
  {
    timeout: REQUEST_TIMEOUT_MS,    // 180 000 ms  (line 41)
    maxRetries: 1,
  }
)
```

`max_tokens: 8192` accommodates full transcripts and summaries. `reasoning: { enabled: true }` is an OpenRouter-specific extension cast as `Record<string, unknown>` (line 120) to bypass the base OpenAI types. When the provider exposes a reasoning trace, it is read from `choice.message.reasoning` (lines 173–178) and returned as `observability.reasoning`.

Token usage is read from `completion.usage` (lines 160–163): `prompt_tokens` → `inputTokens`, `completion_tokens` → `outputTokens`, `total_tokens` → `totalTokens` (falling back to `inputTokens + outputTokens` if absent).

**`RegenerationError` class** — lines 32–39:

```typescript
export class RegenerationError extends Error {
  retryable: boolean;
  constructor(message: string, retryable = true) {
    super(message);
    this.name = "RegenerationError";
    this.retryable = retryable;
  }
}
```

All errors from the LLM layer are wrapped in `RegenerationError`. The `retryable` flag propagates to the route handler (line 88) and into the `ErrorResponse` payload sent to the client.

**`REQUEST_TIMEOUT_MS`** — line 41: `180_000` (180 seconds).

---

## 6. Backend Support Functions

### Diff Engine — `artifacts/api-server/src/lib/diff.ts`

#### `DiffOp` type — line 4

```typescript
export type DiffOp = "same" | "add" | "remove";
```

#### `DiffSegment` interface — lines 6–9

```typescript
export interface DiffSegment {
  type: DiffOp;
  value: string;   // the full line content
}
```

#### `computeLineDiff(oldText: string, newText: string): DiffSegment[]` — lines 23–70

Implements a standard bottom-up LCS (Longest Common Subsequence) diff:

1. **`splitLines(text)`** (lines 11–20) — normalizes `\r\n` → `\n`, splits on `\n`, drops the trailing empty string produced by a final newline so files with/without a trailing newline diff identically.
2. **LCS table** (lines 30–41) — `lcs[i][j]` = length of LCS of `a[i..]` and `b[j..]`, filled bottom-up from `(n-1, m-1)` to `(0, 0)`. `O(n × m)` time and space.
3. **Trace** (lines 44–67) — walks `i, j` from `0, 0`:
   - `a[i] === b[j]` → emit `{ type: "same", value: a[i] }`, advance both.
   - `lcs[i+1][j] >= lcs[i][j+1]` → emit `{ type: "remove", value: a[i] }`, advance `i`.
   - else → emit `{ type: "add", value: b[j] }`, advance `j`.
4. **Drain** (lines 60–67) — remaining `a` lines emit as `"remove"`; remaining `b` lines emit as `"add"`.

#### `DiffStats` interface — lines 72–76

```typescript
export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}
```

#### `diffStats(segments: DiffSegment[]): DiffStats` — lines 78–88

Single `reduce` over the segment array; counts `"add"` → `added`, `"remove"` → `removed`, `"same"` → `unchanged`.

---

### Model Registry — `artifacts/api-server/src/lib/models.ts`

#### `ModelInfo` interface — lines 5–9

```typescript
export interface ModelInfo {
  id: string;
  label: string;
  provider: string;
}
```

#### `AVAILABLE_MODELS: ModelInfo[]` — lines 11–29

Five models verified against the OpenRouter catalog:

| `id` | `label` | `provider` |
|---|---|---|
| `anthropic/claude-sonnet-4.6` | Claude Sonnet 4.6 | Anthropic |
| `anthropic/claude-opus-4.8` | Claude Opus 4.8 | Anthropic |
| `openai/gpt-5.5` | GPT-5.5 | OpenAI |
| `openai/gpt-5.4-mini` | GPT-5.4 Mini | OpenAI |
| `google/gemini-3.5-flash` | Gemini 3.5 Flash | Google |

#### `DEFAULT_MODEL: string` — line 31

`"google/gemini-3.5-flash"` — fastest model in the registry; chosen as default to avoid timeout issues on the Replit proxy (~2-minute limit).

#### `isKnownModel(id: string): boolean` — lines 33–35

Returns `true` if `id` appears in `AVAILABLE_MODELS`. Used in the route handler (line 46 of `regenerate.ts`) as a guard that returns 400 — not 502 — for unrecognized model IDs.

---

### Live Pricing — `artifacts/api-server/src/lib/models.ts`

#### `PricingEntry` interface — lines 37–40

```typescript
interface PricingEntry {
  prompt: number;     // per-token rate for prompt tokens
  completion: number; // per-token rate for completion tokens
}
```

#### `PricingCache` interface — lines 42–45

```typescript
interface PricingCache {
  fetchedAt: number;
  prices: Record<string, PricingEntry>;
}
```

#### `loadPricing(): Promise<Record<string, PricingEntry>>` — lines 50–73

Fetches `https://openrouter.ai/api/v1/models`, parses `pricing.prompt` and `pricing.completion` for each model (as strings, converted via `Number()`). Only entries where both are finite are stored; invalid entries are silently skipped (lines 66–69).

**1-hour TTL in-memory cache:** Module-level `pricingCache: PricingCache | null` (line 47). `PRICING_TTL_MS = 60 * 60 * 1000` (line 48). If `Date.now() - pricingCache.fetchedAt < PRICING_TTL_MS`, the cached value is returned without a network call (lines 51–53). The cache is process-scoped and cleared on restart.

#### `estimateCostUsd(modelId, inputTokens, outputTokens): Promise<number | null>` — lines 76–89

```
cost = (inputTokens × entry.prompt) + (outputTokens × entry.completion)
```

Returns `null` if `loadPricing()` throws or if the model ID is absent from the pricing response (line 84). Never throws — cost unavailability is non-fatal and displayed as `"—"` in the UI.

---

### Seed Fixture — `artifacts/api-server/src/seed/index.ts`

#### `SeedFixture` interface — lines 5–12

```typescript
export interface SeedFixture {
  meetingTitle: string;
  date: string;
  participants: string[];
  v1Transcript: string;
  v1Summary: string;
  feedback: string;
}
```

#### `seedFixture: SeedFixture` — lines 14–21

Hardcoded canonical example used to bootstrap the demo run:

| Field | Content |
|---|---|
| `meetingTitle` | `"Gauntlet Project"` |
| `date` | `"2026-06-12"` |
| `participants` | `["William Dahl (Speaker A)", "Collaborator (Speaker B)"]` |
| `v1Transcript` | Full plain-text Granola transcript (~700 words, line 18) |
| `v1Summary` | Full markdown V1 summary with headings and bullets (line 19) |
| `feedback` | Multi-section review: "What matched" + "What didn't match" with transcript citations (line 20) |

The `SeedFixture` interface matches the `SeedResponse` OpenAPI schema (`lib/api-spec/openapi.yaml` lines 127–158) minus `models` and `defaultModel`, which the route handler appends from `AVAILABLE_MODELS` and `DEFAULT_MODEL` (route handler lines 23–24).

---

### Logger — `artifacts/api-server/src/lib/logger.ts` lines 5–20

```typescript
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  // development: pino-pretty transport (colorized, line 13)
  // production:  standard JSON, no transport (line 12)
})
```

Built on [pino](https://getpino.io/). The `pinoHttp` middleware in `artifacts/api-server/src/app.ts` (lines 9–27) attaches per-request structured logging: requests logged with `{ id, method, url (path only — query string stripped at line 16) }`, responses with `{ statusCode }`. The route handler calls `logger.error(...)` at lines 87 and 92 of `regenerate.ts` on both `RegenerationError` and unexpected errors before returning the 502.
