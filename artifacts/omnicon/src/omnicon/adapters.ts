// ---------------------------------------------------------------------------
// Adapters: shape the regeneration engine's API responses (markdown strings +
// flat line diffs) into the structured view models the OMNICON screens render.
// ---------------------------------------------------------------------------

import type {
  DiffSegment,
  WordDiffSegment,
  Observability,
  ModelInfo,
  SeedResponse,
} from "@workspace/api-client-react";
import type {
  SummarySection,
  TranscriptSegment,
  DiffPair,
  DiffTokenSpan,
  DiffTargetStats,
  ModelOption,
  ModelProviderGroup,
  ObsMetric,
  MeetingSummaryItem,
} from "./mockData";

const HEADER_LABELS = new Set([
  "meeting title",
  "date",
  "meeting participants",
  "participants",
  "attendees",
  "title",
]);

export function initialsOf(name: string): string {
  const cleaned = name.replace(/\([^)]*\)/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Parse a markdown summary (`#`/`###` headings + `-` bullets) into sections.
// Lines that appear before the first heading are collected under an intro
// heading; nested bullets are flattened.
export function parseSummarySections(md: string): SummarySection[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const sections: SummarySection[] = [];
  let current: SummarySection | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      if (current) sections.push(current);
      current = { heading: heading[1].trim(), bullets: [] };
      continue;
    }

    const text = line.replace(/^[-*•]\s+/, "").trim();
    if (!text) continue;
    if (!current) current = { heading: "Summary", bullets: [] };
    current.bullets.push(text);
  }

  if (current) sections.push(current);
  return sections;
}

// Parse a plain-text transcript into speaker segments. Skips the leading
// metadata block (Meeting Title / Date / Participants) and the `Transcript:`
// marker; continuation lines are appended to the previous segment.
export function parseTranscriptSegments(text: string): TranscriptSegment[] {
  const all = text.replace(/\r\n/g, "\n").split("\n");
  const markerIdx = all.findIndex((l) => /^\s*transcript\s*:/i.test(l));
  const body = markerIdx >= 0 ? all.slice(markerIdx + 1) : all;

  const segments: TranscriptSegment[] = [];
  let counter = 0;

  for (const raw of body) {
    const line = raw.trim();
    if (!line) continue;

    const match = line.match(/^([A-Za-z][\w .'\-]{0,40}?):\s*(.*)$/);
    if (match) {
      const speaker = match[1].trim();
      if (HEADER_LABELS.has(speaker.toLowerCase())) continue;
      counter += 1;
      segments.push({
        id: `seg-${counter}`,
        speaker,
        initials: initialsOf(speaker),
        t: "",
        text: match[2].trim(),
      });
    } else if (segments.length) {
      const last = segments[segments.length - 1];
      last.text = last.text ? `${last.text} ${line}` : line;
    }
  }

  return segments;
}

// Convert the engine's flat ordered line diff into GitHub-style side-by-side
// pairs. Consecutive removals/additions are zipped column-to-column; blank
// lines (markdown spacing) are dropped for a cleaner table.
export function flatDiffToPairs(segments: DiffSegment[]): DiffPair[] {
  const pairs: DiffPair[] = [];
  let removeBuf: string[] = [];
  let addBuf: string[] = [];

  const flush = () => {
    const max = Math.max(removeBuf.length, addBuf.length);
    for (let i = 0; i < max; i++) {
      pairs.push({
        left: i < removeBuf.length ? { op: "remove", text: removeBuf[i] } : null,
        right: i < addBuf.length ? { op: "add", text: addBuf[i] } : null,
      });
    }
    removeBuf = [];
    addBuf = [];
  };

  for (const seg of segments) {
    const value = seg.value;
    if (!value.trim()) continue; // skip blank lines

    if (seg.type === "same") {
      flush();
      pairs.push({
        left: { op: "same", text: value },
        right: { op: "same", text: value },
      });
    } else if (seg.type === "remove") {
      removeBuf.push(value);
    } else {
      addBuf.push(value);
    }
  }

  flush();
  return pairs;
}

// Convert the engine's word-level diff into side-by-side pairs. `same`/`add`/
// `remove` segments behave like the line diff (whole-line rows, zipped per
// column), while a `modified` segment becomes a single row whose left/right
// cells carry token spans so only the changed words are highlighted.
export function wordDiffToPairs(segments: WordDiffSegment[]): DiffPair[] {
  const pairs: DiffPair[] = [];
  let removeBuf: string[] = [];
  let addBuf: string[] = [];

  const flush = () => {
    const max = Math.max(removeBuf.length, addBuf.length);
    for (let i = 0; i < max; i++) {
      pairs.push({
        left: i < removeBuf.length ? { op: "remove", text: removeBuf[i] } : null,
        right: i < addBuf.length ? { op: "add", text: addBuf[i] } : null,
      });
    }
    removeBuf = [];
    addBuf = [];
  };

  for (const seg of segments) {
    if (seg.type === "same") {
      if (!seg.value.trim()) continue; // skip blank lines
      flush();
      pairs.push({
        left: { op: "same", text: seg.value },
        right: { op: "same", text: seg.value },
      });
    } else if (seg.type === "modified") {
      flush();
      const tokens = seg.tokens ?? [];
      const leftTokens: DiffTokenSpan[] = tokens
        .filter((t) => t.type !== "add")
        .map((t) => ({ op: t.type, text: t.value }));
      const rightTokens: DiffTokenSpan[] = tokens
        .filter((t) => t.type !== "remove")
        .map((t) => ({ op: t.type, text: t.value }));
      pairs.push({
        left: {
          op: "modified",
          text: leftTokens.map((t) => t.text).join(""),
          tokens: leftTokens,
        },
        right: {
          op: "modified",
          text: rightTokens.map((t) => t.text).join(""),
          tokens: rightTokens,
        },
      });
    } else if (seg.type === "remove") {
      if (!seg.value.trim()) continue; // skip blank lines
      removeBuf.push(seg.value);
    } else {
      if (!seg.value.trim()) continue; // skip blank lines
      addBuf.push(seg.value);
    }
  }

  flush();
  return pairs;
}

export function mapStats(stats: {
  added: number;
  removed: number;
  unchanged: number;
}): DiffTargetStats {
  return {
    additions: stats.added,
    removals: stats.removed,
    unchanged: stats.unchanged,
  };
}

// Turn the engine's free-form change explanation into a bullet list.
export function explanationToBullets(text: string): string[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^([-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
  return lines.length ? lines : [text.trim()];
}

export function observabilityToMetrics(
  obs: Observability,
  modelLabel: string,
  provider?: string,
): ObsMetric[] {
  return [
    { label: "Model", value: modelLabel, sub: provider?.toLowerCase() },
    {
      label: "Input tokens",
      value: obs.inputTokens.toLocaleString(),
      sub: "prompt",
    },
    {
      label: "Output tokens",
      value: obs.outputTokens.toLocaleString(),
      sub: "completion",
    },
    {
      label: "Cost",
      value:
        obs.estimatedCostUsd != null
          ? `$${obs.estimatedCostUsd.toFixed(4)}`
          : "—",
      sub: obs.estimatedCostUsd != null ? "estimated" : "pricing unavailable",
    },
    {
      label: "Latency",
      value: `${(obs.latencyMs / 1000).toFixed(1)}s`,
      sub: "end to end",
    },
    {
      label: "Total tokens",
      value: obs.totalTokens.toLocaleString(),
      sub: "in + out",
    },
  ];
}

export function modelsToGroups(
  models: ModelInfo[],
  defaultModel: string,
): ModelProviderGroup[] {
  const order: string[] = [];
  const byProvider = new Map<string, ModelOption[]>();

  for (const m of models) {
    if (!byProvider.has(m.provider)) {
      byProvider.set(m.provider, []);
      order.push(m.provider);
    }
    byProvider.get(m.provider)!.push({
      id: m.id,
      name: m.label,
      provider: m.provider,
      recommended: m.id === defaultModel,
    });
  }

  return order.map((provider) => ({
    provider,
    models: byProvider.get(provider)!,
  }));
}

// Build the single conversation card shown in the picker from the seed fixture.
export function seedToMeeting(seed: SeedResponse): MeetingSummaryItem {
  const segments = parseTranscriptSegments(seed.v1Transcript);
  const firstBullet = parseSummarySections(seed.v1Summary)[0]?.bullets[0];
  return {
    id: "seed",
    title: seed.meetingTitle,
    date: seed.date,
    platform: "Granola",
    attendees: seed.participants,
    folder: "Imported",
    segmentCount: segments.length,
    wordCount: wordCount(seed.v1Transcript),
    preview: firstBullet ?? "Seeded conversation ready for review.",
    selected: true,
  };
}
