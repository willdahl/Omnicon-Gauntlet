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
