// ---------------------------------------------------------------------------
// OMNICON mock data — shaped like real Granola output (all hardcoded).
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

export const SOURCES: SourceOption[] = [
  {
    id: "granola",
    name: "Granola",
    tagline: "AI meeting notes • local cache (cache-v3.json)",
    connected: true,
    primary: true,
    meetingCount: 47,
    lastSync: "2 min ago",
    note: "Reading from local Granola cache. 47 conversations indexed.",
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
  time: string;
  durationMin: number;
  platform: string;
  attendees: string[];
  folder: string;
  segmentCount: number;
  wordCount: number;
  preview: string;
  selected?: boolean;
}

export const MEETINGS: MeetingSummaryItem[] = [
  {
    id: "mtg-q3-product-review",
    title: "Q3 Product Review",
    date: "Jun 11, 2026",
    time: "10:00 AM",
    durationMin: 52,
    platform: "Google Meet",
    attendees: ["Dana Whitfield", "Marcus Lee", "Priya Nair", "Tomás Reyes"],
    folder: "Product",
    segmentCount: 14,
    wordCount: 1840,
    preview:
      "Roadmap status, mobile rollout slipped to Q4, analytics revamp greenlit, hiring freeze on the design team lifted.",
    selected: true,
  },
  {
    id: "mtg-acme-sales-call",
    title: "Acme Corp — Discovery Call",
    date: "Jun 10, 2026",
    time: "2:30 PM",
    durationMin: 38,
    platform: "Zoom",
    attendees: ["Dana Whitfield", "Sofia Alvarez (Acme)", "Ben Carter (Acme)"],
    folder: "Sales",
    segmentCount: 11,
    wordCount: 1320,
    preview:
      "Acme evaluating for 200 seats, main blocker is SSO + SOC 2, budget approval expected end of quarter.",
  },
  {
    id: "mtg-eng-standup",
    title: "Platform Team Standup",
    date: "Jun 11, 2026",
    time: "9:15 AM",
    durationMin: 16,
    platform: "Slack Huddle",
    attendees: ["Marcus Lee", "Tomás Reyes", "Aiko Tanaka", "Jordan Pace"],
    folder: "Engineering",
    segmentCount: 9,
    wordCount: 640,
    preview:
      "Auth migration on track, flaky e2e tests quarantined, Tomás blocked on staging DB access.",
  },
];

export interface TranscriptSegment {
  id: string;
  speaker: string;
  initials: string;
  t: string; // timestamp mm:ss
  text: string;
  flagged?: boolean; // low-confidence / needs review
  flagReason?: string;
}

// Full transcript for the selected (primary) meeting.
export const TRANSCRIPT: TranscriptSegment[] = [
  { id: "s1", speaker: "Dana Whitfield", initials: "DW", t: "00:12", text: "Alright, let's run the Q3 review. Marcus, kick us off with the roadmap status." },
  { id: "s2", speaker: "Marcus Lee", initials: "ML", t: "00:31", text: "Sure. Web analytics revamp is on track for end of Q3. The mobile rollout is the one I'm worried about — we're not going to make the August date." },
  { id: "s3", speaker: "Dana Whitfield", initials: "DW", t: "01:05", text: "How far does it slip?" },
  { id: "s4", speaker: "Marcus Lee", initials: "ML", t: "01:11", text: "Realistically early Q4. Call it the second week of October if QA cooperates." },
  { id: "s5", speaker: "Priya Nair", initials: "PN", t: "01:34", text: "I can take ownership of the mobile rollout. I've got the bandwidth now that onboarding shipped, and I know the release process." },
  { id: "s6", speaker: "Dana Whitfield", initials: "DW", t: "01:52", text: "Perfect, Priya owns mobile rollout then. Target October 12th. Marcus, you stay on analytics." },
  { id: "s7", speaker: "Tomás Reyes", initials: "TR", t: "02:18", text: "On analytics — we got the greenlight from finance, so the revamp budget is approved. I'll start the data model work next sprint.", flagged: true, flagReason: "Speaker attribution uncertain (overlap with Marcus at 02:15)." },
  { id: "s8", speaker: "Dana Whitfield", initials: "DW", t: "02:44", text: "Good. What about the design hiring freeze?" },
  { id: "s9", speaker: "Priya Nair", initials: "PN", t: "02:51", text: "Lifted as of Monday. We can open the two senior product designer reqs." },
  { id: "s10", speaker: "Marcus Lee", initials: "ML", t: "03:20", text: "One risk: if mobile slips past mid-October it collides with the holiday code freeze, so October 12th is basically the hard deadline." },
  { id: "s11", speaker: "Dana Whitfield", initials: "DW", t: "03:48", text: "Understood. Let's treat the 12th as committed. Priya, send a rollout plan by end of week." },
  { id: "s12", speaker: "Priya Nair", initials: "PN", t: "03:59", text: "Will do. I'll circulate it Thursday." },
  { id: "s13", speaker: "Tomás Reyes", initials: "TR", t: "04:21", text: "Last thing — can we get a decision on the pricing experiment? It's been open three weeks.", flagged: true, flagReason: "Possible transcription gap; audio dropout 04:18–04:20." },
  { id: "s14", speaker: "Dana Whitfield", initials: "DW", t: "04:36", text: "Let's defer pricing to next week's session. That's a wrap, thanks everyone." },
];

export interface SummarySection {
  heading: string;
  bullets: string[];
}

// V1 — initial AI summary (contains a couple of fixable issues).
export const SUMMARY_V1: SummarySection[] = [
  {
    heading: "Overview",
    bullets: [
      "Q3 product review covering roadmap status, mobile rollout, analytics, and design hiring.",
      "The web analytics revamp remains on track for end of Q3.",
    ],
  },
  {
    heading: "Decisions",
    bullets: [
      "Mobile rollout is delayed from August to Q4.",
      "Analytics revamp budget approved by finance.",
      "Design hiring freeze lifted; two senior product designer roles to open.",
    ],
  },
  {
    heading: "Action items",
    bullets: [
      "Marcus to own the mobile rollout and share a plan.",
      "Tomás to begin analytics data model work next sprint.",
      "Pricing experiment decision deferred to next week.",
    ],
  },
];

// V2 — regenerated after reviewer feedback (corrected owner + explicit date).
export const SUMMARY_V2: SummarySection[] = [
  {
    heading: "Overview",
    bullets: [
      "Q3 product review covering roadmap status, mobile rollout, analytics, and design hiring.",
      "The web analytics revamp remains on track for end of Q3.",
    ],
  },
  {
    heading: "Decisions",
    bullets: [
      "Mobile rollout slips from August to a committed launch date of October 12, 2026.",
      "Analytics revamp budget approved by finance.",
      "Design hiring freeze lifted; two senior product designer roles to open.",
    ],
  },
  {
    heading: "Action items",
    bullets: [
      "Priya to own the mobile rollout and circulate a rollout plan by Thursday.",
      "Marcus to continue leading the analytics revamp.",
      "Tomás to begin analytics data model work next sprint.",
      "Pricing experiment decision deferred to next week's session.",
    ],
  },
];

// Reviewer feedback that drove V1 -> V2.
export const REVIEWER_FEEDBACK =
  "The mobile rollout owner is wrong — Priya took ownership, not Marcus. Use the committed date (Oct 12) instead of a vague \"Q4\". Marcus stays on analytics. Also capture that Priya's rollout plan is due Thursday.";

export const REFERENCED_SPAN = {
  segmentId: "s6",
  speaker: "Dana Whitfield",
  t: "01:52",
  text: "Perfect, Priya owns mobile rollout then. Target October 12th. Marcus, you stay on analytics.",
};

// ---- Diff (V1 -> V2) -------------------------------------------------------
export type DiffOp = "same" | "add" | "remove";
export interface DiffLine {
  op: DiffOp;
  heading?: boolean;
  text: string;
}

export const SUMMARY_DIFF: DiffLine[] = [
  { op: "same", heading: true, text: "Overview" },
  { op: "same", text: "Q3 product review covering roadmap status, mobile rollout, analytics, and design hiring." },
  { op: "same", text: "The web analytics revamp remains on track for end of Q3." },
  { op: "same", heading: true, text: "Decisions" },
  { op: "remove", text: "Mobile rollout is delayed from August to Q4." },
  { op: "add", text: "Mobile rollout slips from August to a committed launch date of October 12, 2026." },
  { op: "same", text: "Analytics revamp budget approved by finance." },
  { op: "same", text: "Design hiring freeze lifted; two senior product designer roles to open." },
  { op: "same", heading: true, text: "Action items" },
  { op: "remove", text: "Marcus to own the mobile rollout and share a plan." },
  { op: "add", text: "Priya to own the mobile rollout and circulate a rollout plan by Thursday." },
  { op: "add", text: "Marcus to continue leading the analytics revamp." },
  { op: "same", text: "Tomás to begin analytics data model work next sprint." },
  { op: "remove", text: "Pricing experiment decision deferred to next week." },
  { op: "add", text: "Pricing experiment decision deferred to next week's session." },
];

// Transcript diff — mostly unchanged, a couple of corrected attributions.
export const TRANSCRIPT_DIFF: DiffLine[] = [
  { op: "same", text: "DW 01:52 — Perfect, Priya owns mobile rollout then. Target October 12th." },
  { op: "remove", text: "ML 02:18 — On analytics, we got the greenlight from finance, so the revamp budget is approved." },
  { op: "add", text: "TR 02:18 — On analytics, we got the greenlight from finance, so the revamp budget is approved." },
  { op: "same", text: "PN 02:51 — Lifted as of Monday. We can open the two senior product designer reqs." },
];

export const DIFF_STATS = { additions: 5, removals: 4, unchanged: 9 };

// ---- Models ----------------------------------------------------------------
export type CostTier = "$" | "$$" | "$$$";
export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  context: string;
  cost: CostTier;
  costLabel: string;
  blurb: string;
  recommended?: boolean;
}

export interface ModelProviderGroup {
  provider: string;
  models: ModelOption[];
}

export const MODEL_GROUPS: ModelProviderGroup[] = [
  {
    provider: "Anthropic",
    models: [
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", context: "200K", cost: "$$$", costLabel: "$3 / $15 per Mtok", blurb: "Best reasoning and instruction-following for nuanced summary edits.", recommended: true },
      { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", context: "200K", cost: "$", costLabel: "$0.25 / $1.25 per Mtok", blurb: "Fast and cheap; good for short transcripts." },
    ],
  },
  {
    provider: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", context: "128K", cost: "$$$", costLabel: "$2.50 / $10 per Mtok", blurb: "Strong general-purpose model with reliable structure." },
      { id: "gpt-4o-mini", name: "GPT-4o mini", provider: "OpenAI", context: "128K", cost: "$", costLabel: "$0.15 / $0.60 per Mtok", blurb: "Low-cost option for high-volume review." },
    ],
  },
  {
    provider: "Google",
    models: [
      { id: "gemini-1-5-pro", name: "Gemini 1.5 Pro", provider: "Google", context: "2M", cost: "$$$", costLabel: "$1.25 / $5 per Mtok", blurb: "Massive context window; ideal for very long meetings." },
      { id: "gemini-1-5-flash", name: "Gemini 1.5 Flash", provider: "Google", context: "1M", cost: "$", costLabel: "$0.075 / $0.30 per Mtok", blurb: "Huge context at the lowest price point." },
    ],
  },
  {
    provider: "OpenRouter",
    models: [
      { id: "llama-3-1-70b", name: "Llama 3.1 70B", provider: "OpenRouter", context: "128K", cost: "$", costLabel: "$0.40 / $0.40 per Mtok", blurb: "Open-weight model routed via OpenRouter." },
      { id: "mistral-large", name: "Mistral Large", provider: "OpenRouter", context: "128K", cost: "$$", costLabel: "$2 / $6 per Mtok", blurb: "Capable European model with solid summarization." },
    ],
  },
];

export const DEFAULT_MODEL_ID = "claude-3-5-sonnet";

export const CONTEXT_ADVISORY =
  "This conversation is ~1,840 words (≈ 2.4K tokens). All listed models fit it comfortably; context window only matters for longer meetings.";

// ---- Observability (for the V2 run) ---------------------------------------
export interface ObsMetric {
  label: string;
  value: string;
  sub?: string;
}

export const RUN_OBSERVABILITY: ObsMetric[] = [
  { label: "Model", value: "Claude 3.5 Sonnet", sub: "anthropic" },
  { label: "Input tokens", value: "3,142", sub: "transcript + feedback" },
  { label: "Output tokens", value: "486", sub: "summary v2" },
  { label: "Cost", value: "$0.0167", sub: "$3/$15 per Mtok" },
  { label: "Latency", value: "4.2s", sub: "end to end" },
  { label: "Revision", value: "v2", sub: "1 reviewer pass" },
];

export const RUN_META = {
  runId: "run_7f3a9c2e",
  startedAt: "2026-06-13 14:22:08",
  finishReason: "stop",
  temperature: 0.2,
};
