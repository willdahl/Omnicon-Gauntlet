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
    id: "mtg-gauntlet-project",
    title: "Gauntlet Project",
    date: "Jun 12, 2026",
    time: "—",
    durationMin: 12,
    platform: "In person",
    attendees: ["William Dahl"],
    folder: "Projects",
    segmentCount: 57,
    wordCount: 1640,
    preview:
      "Soundboarding the Gauntlet harness — multi-source transcript/summary ingestion via MCP, a V1 human-in-the-loop review, and the agentic-ETL framing.",
    selected: true,
  },
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
// Source labels kept as captured by Granola (Speaker A / Speaker B); only
// "William Dahl" was listed as a participant — the missing attribution is one
// of the things the reviewer flags for the V2 regeneration to correct.
export const TRANSCRIPT: TranscriptSegment[] = [
  { id: "s1", speaker: "Speaker A", initials: "A", t: "00:00", text: "Going to say gauntlet project. All right, and we're live. So goal here is to create a clone quote harness or the Gauntlet hackathon here." },
  { id: "s2", speaker: "Speaker B", initials: "B", t: "00:11", text: "Yes." },
  { id: "s3", speaker: "Speaker A", initials: "A", t: "00:13", text: "And we got some different pillars which we're not going to discuss right now. But really in my mind, it's not necessarily a harness, it's just like an" },
  { id: "s4", speaker: "Speaker B", initials: "B", t: "00:22", text: "application" },
  { id: "s5", speaker: "Speaker A", initials: "A", t: "00:24", text: "from my perspective. So some of the soundboards lay out problem statement when I'm thinking, when I soundboard the problem statement, what I'm thinking. And so for me, when I used Granola earlier today, I was giving a personal narrative of my background. And so I want to be able to take from that and sort of take the outline and use that to build some visualizations. But it got some things right and some things wrong. And this happens with any summary. Also, if I'm going to extend Granola, I'm going to have some things that are personal, but then if I am working in a professional setting or like ideation or different projects, I don't see a good way that could have different profiles or tagging right now. And so I'm thinking there's a V1, V2, maybe even a V3 version of this application or harness. And so what I'd like to do is set something up that in a lovable. Sorry, it's a replit project where basically I can select an MCP that for a transcript and. Or summary that can be coming from granola or teams or wherever you've got that data flowing in from. So that's data transcript and summary ingestion. And then the V1 is just an ability to review the summary that was there. Does it match what you were looking for? Clarify what you were looking for? Did the summary match? So what matched and what didn't match? And then document that for the things that didn't match, what doesn't. Following up on what doesn't need to be and then. Making those changes both in making documenting those changes in like a V2 of the summary and a V2 of the transcript. And so that way I've got sort of updated context that actually matches what I was going for. And so also in this application there would be a sort of GUI for the model selector, so I can pick any model that I want or have access to. And then an observability pane where I can see the thought process behind everything that I'm doing for those refinements there and the cost that I took for that and the time. And so, yeah..." },
  { id: "s6", speaker: "Speaker B", initials: "B", t: "02:30", text: "Yeah, I mean I think that fits the bill for a harness", flagged: true, flagReason: "Speaker not in participant list — Granola captured only \"William Dahl\"." },
  { id: "s7", speaker: "Speaker A", initials: "A", t: "02:34", text: "for the V0 V1 and then. And then V2. Oh, go ahead. You're going to share something else." },
  { id: "s8", speaker: "Speaker B", initials: "B", t: "02:41", text: "No, go ahead." },
  { id: "s9", speaker: "Speaker A", initials: "A", t: "02:43", text: "V2 is okay. Now I'm starting to add tags to that so that then those tags can help me to understand tags and or profiles. So profiles could be like what am I doing in the work or personal setting versus tags might be like what are the key topics or functions like? Even the work setting I might have a daily standup versus a discovery call versus X, Y or Z. And so maybe I want to then after doing that. So that's just enrichment of data. Then that allows for V3. V3 which could branch into. Okay, I want to then apply templates or guardrail specific instructions to specific types of conversations and or ways to summarize or look across mine. When I'm going back to things like, hey, for all my discovery calls, not only are they templated, but then if I'm asking certain questions and the functions that come from that I can get or think of like in a medical setting you could have. All right, I've got my initial consultation or your annual physical or something like that versus just a follow up call for something specific. Like you might be asking different questions, different ones or want different summaries or dashboards. Thanks for that. Which are more turnkey. But the idea can be sort of templated." },
  { id: "s10", speaker: "Speaker B", initials: "B", t: "03:55", text: "Yeah. Wow. Kind of like thinking like Obsidian where you have like the graph network." },
  { id: "s11", speaker: "Speaker A", initials: "A", t: "04:02", text: "Sure." },
  { id: "s12", speaker: "Speaker B", initials: "B", t: "04:04", text: "And with the tags it's easy to like click in a tag and see all the nodes associated with that tag." },
  { id: "s13", speaker: "Speaker A", initials: "A", t: "04:10", text: "Yeah. And so on and so forth and. And so. But is there something. Am I missing? Is there something that does that out of the box today? Like takes conversation. Ingest conversations from all of. I can have. I can come in. I can come in with a list of my mcps." },
  { id: "s14", speaker: "Speaker B", initials: "B", t: "04:28", text: "There's a tool for anything you can think of nowadays there." },
  { id: "s15", speaker: "Speaker A", initials: "A", t: "04:33", text: "Well, yeah. So I should discover what that is." },
  { id: "s16", speaker: "Speaker B", initials: "B", t: "04:37", text: "But you can but build versus buy." },
  { id: "s17", speaker: "Speaker A", initials: "A", t: "04:40", text: "Yeah. So yeah, I just want to be able to. And I. I could have then turn that into a loop or service and loops across all the mcps I have connected and then queues these up to either transform them, which is like the V2 or V3, or allow for the human in the loop, which is the V1, which is I wanted to start with to make sure." },
  { id: "s18", speaker: "Speaker B", initials: "B", t: "05:02", text: "Yeah. So I think ETL is the term that is not used anymore." },
  { id: "s19", speaker: "Speaker A", initials: "A", t: "05:07", text: "No. Yeah." },
  { id: "s20", speaker: "Speaker B", initials: "B", t: "05:09", text: "Right." },
  { id: "s21", speaker: "Speaker A", initials: "A", t: "05:10", text: "Yeah." },
  { id: "s22", speaker: "Speaker B", initials: "B", t: "05:11", text: "In data engineering realm, like when's the last time you Heard ETL" },
  { id: "s23", speaker: "Speaker A", initials: "A", t: "05:16", text: "two jobs ago." },
  { id: "s24", speaker: "Speaker B", initials: "B", t: "05:18", text: "Right. But I think that's transformed. So ETL is now harnessed." },
  { id: "s25", speaker: "Speaker A", initials: "A", t: "05:23", text: "Okay. Got it." },
  { id: "s26", speaker: "Speaker B", initials: "B", t: "05:25", text: "Right. Like etl. How many steps needed?" },
  { id: "s27", speaker: "Speaker A", initials: "A", t: "05:29", text: "Yeah." },
  { id: "s28", speaker: "Speaker B", initials: "B", t: "05:31", text: "It's. It has the whole framework, it has the loop, it has the boundaries, it has all that. I mean, that's what I'm doing. My horn is this is a big ass ETL tool. But now it's agentic. So the issue of ETL was like it needed to be deterministic. You needed all those rules. But now you can just plug and play an agent for that. Right. Yeah. You don't need to know the rules. Input, output, agent, figure it out.", flagged: true, flagReason: "Speaker not in participant list — likely the collaborator credited in the summary's \"Technical Framing\"." },
  { id: "s29", speaker: "Speaker A", initials: "A", t: "06:05", text: "And there's some other things you could do with that. You could, if you could separate out the transcript from the summary so you can get the same to then start to do comparisons across the summary tools." },
  { id: "s30", speaker: "Speaker B", initials: "B", t: "06:18", text: "Another thing about that is like you have your raw data." },
  { id: "s31", speaker: "Speaker A", initials: "A", t: "06:22", text: "Yeah." },
  { id: "s32", speaker: "Speaker B", initials: "B", t: "06:23", text: "Silver data augmented and golden data. The golden data is like what your desired output is." },
  { id: "s33", speaker: "Speaker A", initials: "A", t: "06:31", text: "Sure." },
  { id: "s34", speaker: "Speaker B", initials: "B", t: "06:33", text: "And that's the gap between raw and golden." },
  { id: "s35", speaker: "Speaker A", initials: "A", t: "06:37", text: "Sure." },
  { id: "s36", speaker: "Speaker B", initials: "B", t: "06:38", text: "And then with retraining." },
  { id: "s37", speaker: "Speaker A", initials: "A", t: "06:41", text: "So you can set up. Yeah. You set up evals and so you can run against that. So." },
  { id: "s38", speaker: "Speaker B", initials: "B", t: "06:49", text: "Yeah." },
  { id: "s39", speaker: "Speaker A", initials: "A", t: "06:50", text: "Cool." },
  { id: "s40", speaker: "Speaker B", initials: "B", t: "06:51", text: "Yeah." },
  { id: "s41", speaker: "Speaker A", initials: "A", t: "06:52", text: "Thank you." },
  { id: "s42", speaker: "Speaker B", initials: "B", t: "06:54", text: "Yeah. ETL was. The, the word that got lost." },
  { id: "s43", speaker: "Speaker A", initials: "A", t: "06:58", text: "Yeah. Do you use or would you use something like that for meetings and conversations or do you just use like something that's roll out of the box or" },
  { id: "s44", speaker: "Speaker B", initials: "B", t: "07:08", text: "you don't and you get more automated on that. You shouldn't remember now. I'm just old school right now." },
  { id: "s45", speaker: "Speaker A", initials: "A", t: "07:16", text: "Okay. Well, I'm just trying to remember. Yeah. And I've been, I've been, I've been working really useful." },
  { id: "s46", speaker: "Speaker B", initials: "B", t: "07:24", text: "Like where after the meeting. Right. You, you have those raw notes. But then you need to take action on it. Whether you need to create tickets. Yeah. On the product. On the product side. Or it's something that you need to do internally. There's just like so many things you can do with that. Raw data that needs post processing." },
  { id: "s47", speaker: "Speaker A", initials: "A", t: "07:42", text: "Yeah." },
  { id: "s48", speaker: "Speaker B", initials: "B", t: "07:43", text: "Right. Because after granola is just sitting there not doing much." },
  { id: "s49", speaker: "Speaker A", initials: "A", t: "07:47", text: "Yeah. And I think it makes sense for that to live eventually outside of the platform that's capturing the information. Because I think that granola doesn't. Not that it doesn't, it doesn't have the ability to modify the summaries or how it summarizes or how it tags and like what you would want to do with it beyond that. So really to me the biggest thing is having actually like a. Who's got the best transcription is what I think is. And then who's got what model plus sort of harness combination gives the best summaries either out of the box thing or. Or because you could. You could have. I think you'd have like an open source marketplace for that sort of thing. I don't know why that probably exists. Maybe it doesn't. So maybe that's a do some research. Yeah." },
  { id: "s50", speaker: "Speaker B", initials: "B", t: "08:40", text: "I'm sure a lot of other people are having the same issue." },
  { id: "s51", speaker: "Speaker A", initials: "A", t: "08:45", text: "Yeah exactly." },
  { id: "s52", speaker: "Speaker B", initials: "B", t: "08:47", text: "But everybody's using a note taker tool like yeah. They're to do something with it. But I think for your use case is like given all this raw data, raw transcripts how does it get into your knowledge base? Whether it's your internal knowledge base or your company knowledge base. And there's a lot of steps to get there." },
  { id: "s53", speaker: "Speaker A", initials: "A", t: "09:10", text: "Sure." },
  { id: "s54", speaker: "Speaker B", initials: "B", t: "09:12", text: "Raw data to knowledge base. Right. Yeah. Tagging. You can now associate data and link the nodes in a certain way." },
  { id: "s55", speaker: "Speaker A", initials: "A", t: "09:22", text: "Cool." },
  { id: "s56", speaker: "Speaker B", initials: "B", t: "09:24", text: "Then extracting actions that needs to happen." },
  { id: "s57", speaker: "Speaker A", initials: "A", t: "09:28", text: "I think actions are things that are good. I just want to make the MVP where the notes of summary have the ability to review that with human loop first. And then my thought is if you build maybe you keep statistics over time on like which summaries and which transcripts. You know how much you had to change about it as a way of benchmarking over time. And then you could see that and or providing those conversation specific sort of templates or guidelines. I think that will let you triangulate more to help you have higher fidelity automation down the line for whatever you're willing to pay for the token usage that that helps or not. So yeah. Thank you. Yeah thank you for soundboarding 12 minutes. So. So I if I could." },
];

export interface SummarySection {
  heading: string;
  bullets: string[];
}

// V1 — initial AI summary (the Granola output the reviewer will critique).
// Sub-points are encoded as "– "-prefixed bullets so the flat renderer is unchanged.
export const SUMMARY_V1: SummarySection[] = [
  {
    heading: "The Gauntlet Concept",
    bullets: [
      "App to ingest meeting transcripts/summaries from any source (Granola, Teams, etc.) via MCP",
      "Core problem: existing tools (e.g. Granola) lack ability to modify summaries, apply custom templates, or tag/profile conversations",
      "End goal: route raw meeting data into a personal or company knowledge base with high-fidelity, enriched output",
    ],
  },
  {
    heading: "Versioned Roadmap",
    bullets: [
      "V1 — human-in-the-loop summary review",
      "– Ingest transcript + summary",
      "– User reviews: what matched, what didn’t",
      "– Document gaps → produce V2 summary and V2 transcript",
      "– GUI for model selection + observability pane (thought process, cost, latency)",
      "V2 — enrichment via tags and profiles",
      "– Profiles: work vs. personal context",
      "– Tags: meeting type (standup, discovery call, etc.) and key topics",
      "V3 — templates and cross-conversation intelligence",
      "– Apply guardrails/templates to specific conversation types",
      "– Query across meetings by tag (e.g. “all discovery calls”)",
      "– Analogy: Obsidian-style graph — click a tag, see all linked nodes",
    ],
  },
  {
    heading: "Technical Framing (from collaborator)",
    bullets: [
      "ETL is the right mental model — now agentic rather than rule-based",
      "– Old ETL: deterministic, required explicit rules",
      "– Agentic ETL: input → output → agent figures it out",
      "Data tiers: raw → silver (augmented) → golden (desired output)",
      "– Gap between raw and golden = what the harness closes",
      "Keeping transcript and summary separate enables cross-tool comparison (benchmark different summarization models)",
      "Tracking how much each summary needed to change over time = built-in eval/benchmarking signal",
    ],
  },
  {
    heading: "Open Questions",
    bullets: [
      "Does a tool already exist that ingests conversations from multiple sources and routes them into a knowledge base?",
      "Is there an open-source marketplace for summary templates/harness configurations?",
    ],
  },
  {
    heading: "Next Steps",
    bullets: [
      "William",
      "– Research existing tools that do multi-source transcript ingestion + knowledge base routing (build vs. buy)",
      "– Research open-source marketplaces for summarization templates",
      "– Start V1 build in Replit: transcript/summary ingestion → human review loop → model selector + observability pane",
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

// Reviewer feedback that drives V1 -> V2 (pre-filled in the review workspace).
export const REVIEWER_FEEDBACK = `What matched — leave unchanged
• The Versioned Roadmap V2 and V3 bullets are accurate.
• The Technical Framing (from collaborator) section is accurate, including the raw → silver → golden tiers and the agentic-ETL framing.
• "Keeping transcript and summary separate enables cross-tool comparison" is correct and worth keeping verbatim.

What didn't match — please correct (each is grounded in the transcript)
1. Missing the originating motivation. The Gauntlet Concept never says what kicked this off — I'd used Granola to capture a personal narrative of my background and wanted to turn that outline into visualizations, but it "got some things right and some things wrong." Add a bullet capturing that origin.
2. "Best transcription" is a core driver and it's absent. A primary goal is comparing transcription quality across providers, not just summary quality. Add this to the concept or to Open Questions.
3. The V1 bullet is too thin on mechanics. Note that V1 runs as a loop/queue across connected MCPs that routes each conversation either to human review (V1) or to transformation (V2/V3).
4. The deferred-actions decision is missing. We discussed extracting actions/tickets and I deliberately deferred it — the MVP is human review of the summary first. Add a one-line scope note.
5. Attendee/speaker labels are incomplete. The transcript header lists only "William Dahl," but this was a two-person soundboard — Speaker A is me, Speaker B is a collaborator. Label Speaker B as "Collaborator."`;

export const REFERENCED_SPAN = {
  segmentId: "s5",
  speaker: "Speaker A",
  t: "00:24",
  text: "When I used Granola earlier today, I was giving a personal narrative of my background … take the outline and use that to build some visualizations. But it got some things right and some things wrong.",
};

// ---- Diff (V1 -> V2) -------------------------------------------------------
// Side-by-side (GitHub-style) diff model. Each row aligns a V1 (left) cell with
// a V2 (right) cell. A `null` cell means there is no counterpart on that side.
export type SideOp = "same" | "add" | "remove";
export interface DiffCell {
  op: SideOp;
  text: string;
}
export interface DiffPair {
  heading?: string; // section divider spanning both columns
  left?: DiffCell | null;
  right?: DiffCell | null;
}

export const SUMMARY_DIFF_PAIRS: DiffPair[] = [
  { heading: "Overview" },
  {
    left: { op: "same", text: "Q3 product review covering roadmap status, mobile rollout, analytics, and design hiring." },
    right: { op: "same", text: "Q3 product review covering roadmap status, mobile rollout, analytics, and design hiring." },
  },
  {
    left: { op: "same", text: "The web analytics revamp remains on track for end of Q3." },
    right: { op: "same", text: "The web analytics revamp remains on track for end of Q3." },
  },
  { heading: "Decisions" },
  {
    left: { op: "remove", text: "Mobile rollout is delayed from August to Q4." },
    right: { op: "add", text: "Mobile rollout slips from August to a committed launch date of October 12, 2026." },
  },
  {
    left: { op: "same", text: "Analytics revamp budget approved by finance." },
    right: { op: "same", text: "Analytics revamp budget approved by finance." },
  },
  {
    left: { op: "same", text: "Design hiring freeze lifted; two senior product designer roles to open." },
    right: { op: "same", text: "Design hiring freeze lifted; two senior product designer roles to open." },
  },
  { heading: "Action items" },
  {
    left: { op: "remove", text: "Marcus to own the mobile rollout and share a plan." },
    right: { op: "add", text: "Priya to own the mobile rollout and circulate a rollout plan by Thursday." },
  },
  {
    left: null,
    right: { op: "add", text: "Marcus to continue leading the analytics revamp." },
  },
  {
    left: { op: "same", text: "Tomás to begin analytics data model work next sprint." },
    right: { op: "same", text: "Tomás to begin analytics data model work next sprint." },
  },
  {
    left: { op: "remove", text: "Pricing experiment decision deferred to next week." },
    right: { op: "add", text: "Pricing experiment decision deferred to next week's session." },
  },
];

// Transcript diff — mostly unchanged, one corrected speaker attribution.
export const TRANSCRIPT_DIFF_PAIRS: DiffPair[] = [
  {
    left: { op: "same", text: "DW 01:52 — Perfect, Priya owns mobile rollout then. Target October 12th." },
    right: { op: "same", text: "DW 01:52 — Perfect, Priya owns mobile rollout then. Target October 12th." },
  },
  {
    left: { op: "remove", text: "ML 02:18 — On analytics, we got the greenlight from finance, so the revamp budget is approved." },
    right: { op: "add", text: "TR 02:18 — On analytics, we got the greenlight from finance, so the revamp budget is approved." },
  },
  {
    left: { op: "same", text: "PN 02:51 — Lifted as of Monday. We can open the two senior product designer reqs." },
    right: { op: "same", text: "PN 02:51 — Lifted as of Monday. We can open the two senior product designer reqs." },
  },
];

// Per-target change stats, derived from the pairs above.
export const DIFF_TARGET_STATS = {
  summary: { additions: 4, removals: 3, unchanged: 5 },
  transcript: { additions: 1, removals: 1, unchanged: 2 },
};

// Plain-language recap of what changed, shown above the diff itself.
export const DIFF_CHANGE_SUMMARY = {
  summary: [
    "Corrected the mobile rollout owner from Marcus to Priya, with an explicit committed date (October 12, 2026).",
    "Added that Marcus continues leading the analytics revamp.",
    "Tightened the wording on the pricing-experiment deferral.",
  ],
  transcript: [
    "Fixed one speaker attribution at 02:18 — the analytics budget line was reassigned from Marcus to Tomás.",
  ],
};

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
  "This conversation is ~1,640 words (≈ 2.1K tokens). All listed models fit it comfortably; context window only matters for longer meetings.";

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
