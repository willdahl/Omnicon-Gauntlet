// Line-based diff producing an ordered list of segments (same/add/remove)
// suitable for rendering a side-by-side V1 <-> V2 comparison.

export type DiffOp = "same" | "add" | "remove";

export interface DiffSegment {
  type: DiffOp;
  value: string;
}

function splitLines(text: string): string[] {
  // Normalize line endings, then split. Trailing empty line is dropped so a
  // document with/without a final newline diffs the same.
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

// Standard LCS-based line diff.
export function computeLineDiff(oldText: string, newText: string): DiffSegment[] {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const n = a.length;
  const m = b.length;

  // lcs[i][j] = length of LCS of a[i..] and b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        lcs[i][j] = lcs[i + 1][j + 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
      }
    }
  }

  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      segments.push({ type: "same", value: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      segments.push({ type: "remove", value: a[i] });
      i++;
    } else {
      segments.push({ type: "add", value: b[j] });
      j++;
    }
  }
  while (i < n) {
    segments.push({ type: "remove", value: a[i] });
    i++;
  }
  while (j < m) {
    segments.push({ type: "add", value: b[j] });
    j++;
  }

  return segments;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export function diffStats(segments: DiffSegment[]): DiffStats {
  return segments.reduce<DiffStats>(
    (acc, seg) => {
      if (seg.type === "add") acc.added++;
      else if (seg.type === "remove") acc.removed++;
      else acc.unchanged++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 },
  );
}

// ---------------------------------------------------------------------------
// Word-level (intra-line) diff
// ---------------------------------------------------------------------------
// Builds on the line diff: lines with no counterpart stay whole add/remove
// rows, but a removed line paired with an added line becomes a single
// `modified` segment whose `tokens` mark exactly which words changed. This lets
// a speaker-only edit (`Speaker A:` -> `Speaker B:`) render as one row with just
// the name highlighted instead of two stacked all-red / all-green rows.

export interface DiffToken {
  type: DiffOp; // same | add | remove
  value: string;
}

export type WordDiffOp = "same" | "add" | "remove" | "modified";

export interface WordDiffSegment {
  type: WordDiffOp;
  value: string; // whole-line text (same/add/remove); V2 line for modified
  tokens?: DiffToken[]; // only set for modified rows
}

// Split a line into words and the whitespace between them, keeping both so the
// original spacing can be reconstructed exactly from the tokens.
function tokenizeWords(line: string): string[] {
  return line.split(/(\s+)/).filter((t) => t.length > 0);
}

// Standard LCS token diff over two tokenized lines.
function computeTokenDiff(oldLine: string, newLine: string): DiffToken[] {
  const a = tokenizeWords(oldLine);
  const b = tokenizeWords(newLine);
  const n = a.length;
  const m = b.length;

  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const tokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      tokens.push({ type: "same", value: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      tokens.push({ type: "remove", value: a[i] });
      i++;
    } else {
      tokens.push({ type: "add", value: b[j] });
      j++;
    }
  }
  while (i < n) tokens.push({ type: "remove", value: a[i++] });
  while (j < m) tokens.push({ type: "add", value: b[j++] });
  return tokens;
}

// Convert a flat line diff into a word-level diff: pair adjacent removed/added
// lines into `modified` segments (with token spans), keeping leftover removes
// and adds as whole-line rows.
export function computeWordDiff(
  oldText: string,
  newText: string,
): WordDiffSegment[] {
  const lineSegments = computeLineDiff(oldText, newText);
  const out: WordDiffSegment[] = [];

  let removeBuf: string[] = [];
  let addBuf: string[] = [];

  const flushBlock = () => {
    const paired = Math.min(removeBuf.length, addBuf.length);
    for (let k = 0; k < paired; k++) {
      out.push({
        type: "modified",
        value: addBuf[k],
        tokens: computeTokenDiff(removeBuf[k], addBuf[k]),
      });
    }
    for (let k = paired; k < removeBuf.length; k++) {
      out.push({ type: "remove", value: removeBuf[k] });
    }
    for (let k = paired; k < addBuf.length; k++) {
      out.push({ type: "add", value: addBuf[k] });
    }
    removeBuf = [];
    addBuf = [];
  };

  for (const seg of lineSegments) {
    if (seg.type === "same") {
      flushBlock();
      out.push({ type: "same", value: seg.value });
    } else if (seg.type === "remove") {
      removeBuf.push(seg.value);
    } else {
      addBuf.push(seg.value);
    }
  }
  flushBlock();

  return out;
}

// Token-level stats so the word method's badges stay coherent: a speaker-only
// edit reads as a small +1/-1 rather than a wholesale line add+remove.
// Whitespace tokens are ignored so only meaningful words are counted.
export function wordDiffStats(segments: WordDiffSegment[]): DiffStats {
  const stats: DiffStats = { added: 0, removed: 0, unchanged: 0 };
  const countWords = (text: string, bucket: keyof DiffStats) => {
    for (const w of tokenizeWords(text)) {
      if (w.trim()) stats[bucket]++;
    }
  };

  for (const seg of segments) {
    if (seg.type === "modified") {
      for (const tok of seg.tokens ?? []) {
        if (!tok.value.trim()) continue;
        if (tok.type === "add") stats.added++;
        else if (tok.type === "remove") stats.removed++;
        else stats.unchanged++;
      }
    } else if (seg.type === "add") {
      countWords(seg.value, "added");
    } else if (seg.type === "remove") {
      countWords(seg.value, "removed");
    } else {
      countWords(seg.value, "unchanged");
    }
  }
  return stats;
}
