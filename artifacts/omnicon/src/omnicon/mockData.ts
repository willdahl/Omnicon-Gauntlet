// ---------------------------------------------------------------------------
// OMNICON shared types + the one piece of static chrome that remains (the
// source picker). All meeting / transcript / summary / diff / model /
// observability data now comes live from the regeneration engine — see
// `adapters.ts` for the transforms that shape the API responses into these
// types.
// ---------------------------------------------------------------------------

export type Tone = "accent" | "neutral" | "green" | "red" | "amber" | "outline";

export interface SourceOption {
  id: string;
  name: string;
  tagline: string;
  connected: boolean;
  primary?: boolean;
  meetingCount?: number;
  lastSync?: string;
  note?: string;
}

// The source picker is intentionally cosmetic — OMNICON reads from the Granola
// seed fixture. The other sources advertise where future ingestion will plug in.
export const SOURCES: SourceOption[] = [
  {
    id: "granola",
    name: "Granola",
    tagline: "AI meeting notes • local cache (cache-v3.json)",
    connected: true,
    primary: true,
    meetingCount: 1,
    lastSync: "just now",
    note: "Reading from the seeded Granola conversation.",
  },
  {
    id: "otter",
    name: "Otter.ai",
    tagline: "Live transcription & notes",
    connected: false,
    note: "Connect to import Otter conversations.",
  },
  {
    id: "fireflies",
    name: "Fireflies.ai",
    tagline: "Meeting recorder & search",
    connected: false,
    note: "Connect to import Fireflies recaps.",
  },
  {
    id: "upload",
    name: "Local upload",
    tagline: "Drop a .vtt / .txt transcript",
    connected: false,
    note: "Bring your own transcript file.",
  },
];

export interface MeetingSummaryItem {
  id: string;
  title: string;
  date: string;
  platform: string;
  attendees: string[];
  folder: string;
  segmentCount: number;
  wordCount: number;
  preview: string;
  selected?: boolean;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  initials: string;
  t: string; // timestamp mm:ss (may be empty for sources without timing)
  text: string;
  flagged?: boolean; // low-confidence / needs review
  flagReason?: string;
}

export interface SummarySection {
  heading: string;
  bullets: string[];
}

// ---- Diff (V1 -> V2) -------------------------------------------------------
// Side-by-side (GitHub-style) diff model. Each row aligns a V1 (left) cell with
// a V2 (right) cell. A `null` cell means there is no counterpart on that side.
export type SideOp = "same" | "add" | "remove" | "modified";

// Intra-line token for a `modified` cell — highlights only the words that
// changed while leaving unchanged words plain.
export type TokenOp = "same" | "add" | "remove";
export interface DiffTokenSpan {
  op: TokenOp;
  text: string;
}

export interface DiffCell {
  op: SideOp;
  text: string;
  tokens?: DiffTokenSpan[]; // present when op === "modified"
}
export interface DiffPair {
  heading?: string; // section divider spanning both columns
  left?: DiffCell | null;
  right?: DiffCell | null;
}

export interface DiffTargetStats {
  additions: number;
  removals: number;
  unchanged: number;
}

// The selectable diff presentation method in the Review screen.
export type DiffMethod = "line" | "word";

// ---- Models ----------------------------------------------------------------
export type CostTier = "$" | "$$" | "$$$";
export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  context?: string;
  cost?: CostTier;
  costLabel?: string;
  blurb?: string;
  recommended?: boolean;
}

export interface ModelProviderGroup {
  provider: string;
  models: ModelOption[];
}

export const CONTEXT_ADVISORY =
  "Pick the model that will review the transcript and regenerate the summary. Switching models changes which LLM is actually called — the run telemetry on the final screen reflects your choice.";

// ---- Observability ---------------------------------------------------------
export interface ObsMetric {
  label: string;
  value: string;
  sub?: string;
}

export interface RunMeta {
  finishReason: string;
  model: string;
  totalTokens: number;
  reasoning?: string | null;
}
