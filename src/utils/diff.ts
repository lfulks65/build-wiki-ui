/**
 * src/utils/diff.ts
 *
 * Line-level text diff utility using LCS (Longest Common Subsequence).
 * Produces an annotated diff with old/new line numbers, ready for rendering.
 */

/* ── Types ─────────────────────────────────────────────────────────────── */

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: { old: number | null; new: number | null };
}

export interface DiffResult {
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
}

/* ── LCS computation ───────────────────────────────────────────────────── */

/**
 * Compute the Longest Common Subsequence indices for two arrays.
 * Returns the match pairs as [oldIndex, newIndex] tuples.
 */
function lcsIndices<T>(a: T[], b: T[]): Array<[number, number]> {
  const m = a.length;
  const n = b.length;

  if (m === 0 || n === 0) return [];

  // Build the DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find matching indices
  const pairs: Array<[number, number]> = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      pairs.unshift([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return pairs;
}

/* ── Public API ────────────────────────────────────────────────────────── */

/**
 * Compute a line-level diff between two text strings.
 *
 * Splits both texts into lines (preserving content without newline chars),
 * computes the LCS for accurate line matching, and returns annotated
 * diff lines with old/new line numbers.
 *
 * @param oldText — the original text
 * @param newText — the modified text
 * @returns DiffResult with lines, addedCount, and removedCount
 */
export function computeDiff(oldText: string, newText: string): DiffResult {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  // Handle edge cases
  if (oldText === '' && newText === '') {
    return { lines: [], addedCount: 0, removedCount: 0 };
  }

  if (oldText === '' && newText !== '') {
    const lines: DiffLine[] = newLines.map((content, idx) => ({
      type: 'added' as const,
      content,
      lineNumber: { old: null, new: idx + 1 },
    }));
    return { lines, addedCount: newLines.length, removedCount: 0 };
  }

  if (oldText !== '' && newText === '') {
    const lines: DiffLine[] = oldLines.map((content, idx) => ({
      type: 'removed' as const,
      content,
      lineNumber: { old: idx + 1, new: null },
    }));
    return { lines, addedCount: 0, removedCount: oldLines.length };
  }

  // Identical content
  if (oldText === newText) {
    const lines: DiffLine[] = newLines.map((content, idx) => ({
      type: 'unchanged' as const,
      content,
      lineNumber: { old: idx + 1, new: idx + 1 },
    }));
    return { lines, addedCount: 0, removedCount: 0 };
  }

  // Compute LCS matches
  const pairs = lcsIndices(oldLines, newLines);

  // Build the diff by walking through old and new lines, using pairs as anchors
  const lines: DiffLine[] = [];
  let oldIdx = 0;
  let newIdx = 0;
  let pairPtr = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    // Have we reached the next match?
    if (pairPtr < pairs.length && oldIdx === pairs[pairPtr][0] && newIdx === pairs[pairPtr][1]) {
      // Any removals before this match
      while (oldIdx < pairs[pairPtr][0]) {
        lines.push({
          type: 'removed',
          content: oldLines[oldIdx],
          lineNumber: { old: oldIdx + 1, new: null },
        });
        oldIdx++;
      }
      // Any additions before this match
      while (newIdx < pairs[pairPtr][1]) {
        lines.push({
          type: 'added',
          content: newLines[newIdx],
          lineNumber: { old: null, new: newIdx + 1 },
        });
        newIdx++;
      }
      // The matching line
      lines.push({
        type: 'unchanged',
        content: oldLines[oldIdx],
        lineNumber: { old: oldIdx + 1, new: newIdx + 1 },
      });
      oldIdx++;
      newIdx++;
      pairPtr++;
    } else {
      // We're between matches — collect deletions and additions
      // Check if current old line is consumed by a future pair
      const oldMatched = pairPtr < pairs.length && oldIdx === pairs[pairPtr][0];
      const newMatched = pairPtr < pairs.length && newIdx === pairs[pairPtr][1];

      if (!oldMatched && oldIdx < oldLines.length) {
        lines.push({
          type: 'removed',
          content: oldLines[oldIdx],
          lineNumber: { old: oldIdx + 1, new: null },
        });
        oldIdx++;
      } else if (!newMatched && newIdx < newLines.length) {
        lines.push({
          type: 'added',
          content: newLines[newIdx],
          lineNumber: { old: null, new: newIdx + 1 },
        });
        newIdx++;
      } else if (oldMatched && oldIdx < oldLines.length) {
        // oldIdx will be consumed by match, but newIdx also needs to catch up
        // This shouldn't normally happen, but safety
        lines.push({
          type: 'removed',
          content: oldLines[oldIdx],
          lineNumber: { old: oldIdx + 1, new: null },
        });
        oldIdx++;
      } else if (newMatched && newIdx < newLines.length) {
        lines.push({
          type: 'added',
          content: newLines[newIdx],
          lineNumber: { old: null, new: newIdx + 1 },
        });
        newIdx++;
      }
    }
  }

  const addedCount = lines.filter((l) => l.type === 'added').length;
  const removedCount = lines.filter((l) => l.type === 'removed').length;

  return { lines, addedCount, removedCount };
}
