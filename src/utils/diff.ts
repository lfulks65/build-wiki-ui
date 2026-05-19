/**
 * Line-level text diff utility using LCS (Longest Common Subsequence).
 *
 * Produces an array of `DiffLine` objects annotated as `added`, `removed`,
 * or `unchanged` with old/new line numbers — suitable for feeding a
 * `<DiffViewer>` component.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber: { old: number; new: number };
}

export interface DiffResult {
  /** All diff lines in order */
  lines: DiffLine[];
  /** Count of added lines */
  added: number;
  /** Count of removed lines */
  removed: number;
  /** Count of unchanged lines */
  unchanged: number;
}

/* ------------------------------------------------------------------ */
/*  LCS-based line diff                                                */
/* ------------------------------------------------------------------ */

/**
 * Compute a line-level diff between `oldText` and `newText` using the
 * classical Longest Common Subsequence algorithm.
 *
 * @param oldText — text before the change
 * @param newText — text after the change
 * @returns a `DiffResult` with annotated lines, counts, etc.
 */
export function computeDiff(
  oldText: string,
  newText: string,
): DiffResult {
  // Handle trivial / identical cases early
  if (oldText === newText) {
    const lines =
      oldText.length > 0
        ? oldText.split("\n").map((content, i) => ({
            type: "unchanged" as const,
            content,
            lineNumber: { old: i + 1, new: i + 1 },
          }))
        : [];
    return { lines, added: 0, removed: 0, unchanged: lines.length };
  }
  if (oldText.length === 0) {
    const lines = newText.split("\n").map((content, i) => ({
      type: "added" as const,
      content,
      lineNumber: { old: 0, new: i + 1 },
    }));
    return { lines, added: lines.length, removed: 0, unchanged: 0 };
  }
  if (newText.length === 0) {
    const lines = oldText.split("\n").map((content, i) => ({
      type: "removed" as const,
      content,
      lineNumber: { old: i + 1, new: 0 },
    }));
    return { lines, added: 0, removed: lines.length, unchanged: 0 };
  }

  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const m = oldLines.length;
  const n = newLines.length;

  // Build LCS table — but use a memory-efficient approach.
  // For typical wiki pages (< 5000 lines) a full 2D table is fine.
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack through the LCS table to build the diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({
        type: "unchanged",
        content: oldLines[i - 1],
        lineNumber: { old: i, new: j },
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: "added",
        content: newLines[j - 1],
        lineNumber: { old: 0, new: j },
      });
      j--;
    } else {
      result.unshift({
        type: "removed",
        content: oldLines[i - 1],
        lineNumber: { old: i, new: 0 },
      });
      i--;
    }
  }

  const added = result.filter((l) => l.type === "added").length;
  const removed = result.filter((l) => l.type === "removed").length;
  const unchanged = result.filter((l) => l.type === "unchanged").length;

  return { lines: result, added, removed, unchanged };
}
