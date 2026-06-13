import type { SummarySection, TranscriptSegment } from "./mockData";

export interface ExportDiffStats {
  additions: number;
  removals: number;
}

function toFilename(title: string, artifact: string): string {
  const slug = title
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");
  return `${slug}_${artifact}_v2.md`;
}

function downloadBlob(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function exportSummary(title: string, sections: SummarySection[]): void {
  const lines: string[] = [
    `# ${title}`,
    `*Generated: ${todayLabel()}*`,
    "",
  ];
  for (const section of sections) {
    lines.push(`## ${section.heading}`, "");
    for (const bullet of section.bullets) {
      lines.push(`- ${bullet}`);
    }
    lines.push("");
  }
  downloadBlob(lines.join("\n"), toFilename(title, "Summary"));
}

export function exportTranscript(
  title: string,
  segments: TranscriptSegment[],
): void {
  const lines: string[] = [
    `# ${title} — Transcript`,
    `*Generated: ${todayLabel()}*`,
    "",
  ];
  segments.forEach((seg, i) => {
    lines.push(`**${seg.speaker}:** ${seg.text}`);
    if (i < segments.length - 1) {
      lines.push("", "---", "");
    }
  });
  downloadBlob(lines.join("\n"), toFilename(title, "Transcript"));
}

export function exportReviewNotes(
  title: string,
  feedback: string,
  changes: string[],
  summaryStats: ExportDiffStats,
  transcriptStats: ExportDiffStats,
): void {
  const lines: string[] = [
    `# ${title} — Review Notes`,
    `*Generated: ${todayLabel()}*`,
    "",
    "## Reviewer Feedback",
    "",
    feedback.trim(),
    "",
    "## Changes Made",
    "",
    ...changes.map((c) => `- ${c}`),
    "",
    "## Diff Stats",
    "",
    `**Summary:** +${summaryStats.additions} lines added, -${summaryStats.removals} lines removed`,
    `**Transcript:** +${transcriptStats.additions} lines added, -${transcriptStats.removals} lines removed`,
    "",
  ];
  downloadBlob(lines.join("\n"), toFilename(title, "Review_Notes"));
}
