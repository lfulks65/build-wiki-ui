/**
 * Backlinks utility — extract wiki links from markdown and build a reverse index.
 *
 * Supports three link formats:
 * - `[[Page Title]]`  wiki-style links (matched case-insensitively by title)
 * - `[text](/pages/slug)`  markdown links (matched by slug)
 * - `/pages/slug`  bare URLs in text (matched by slug)
 */

/* ── Types ─────────────────────────────────────────────────────────────── */

/** A single backlink: a source page that links to a target. */
export interface Backlink {
  /** Path/slug of the source page (relative to vault root). */
  sourcePath: string;
  /** Display title of the source page. */
  sourceTitle: string;
  /** Context snippet (~50 chars before + after the link, with the link highlighted). */
  context: string;
}

/** A page with its path, title, and raw markdown content. */
export interface PageWithContent {
  path: string;
  title: string;
  content: string;
}

/* ── Constants ─────────────────────────────────────────────────────────── */

const CONTEXT_CHARS = 50;

/* ── Cache & Version Tracking ──────────────────────────────────────────── */

/** Module-level cached index: Map<path, Backlink[]> */
let _cachedIndex: Map<string, Backlink[]> | null = null;

/** Monotonically increasing counter — incremented each time the cache is cleared. */
let _cacheVersion = 0;

/**
 * Get the current cache version number. Increments whenever the cache is cleared.
 * Consumers can poll this to detect when a recomputation is needed.
 */
export function getCacheVersion(): number {
  return _cacheVersion;
}

/**
 * Clear the module-level cache. Call when pages change.
 */
export function clearBacklinkCache(): void {
  _cachedIndex = null;
  _cacheVersion++;
}

/* ── Overlap Tracker ───────────────────────────────────────────────────── */

/** Tracks positions of already-matched links to prevent bare URL overlap. */
class OverlapTracker {
  private ranges: Array<{ start: number; end: number }> = [];

  add(start: number, end: number): void {
    this.ranges.push({ start, end });
  }

  /** Returns true if the given range overlaps with any tracked range. */
  overlaps(start: number, end: number): boolean {
    return this.ranges.some(
      (r) => start < r.end && end > r.start,
    );
  }
}

/* ── Link Extraction ───────────────────────────────────────────────────── */

/**
 * Extract all wiki links from markdown content for a single page.
 *
 * @param content — Raw markdown content of the source page.
 * @param pageTitles — Map of lowercase title → path for wiki link resolution.
 * @param sourcePath — The source page path (for backlink attribution).
 * @param sourceTitle — The source page title.
 * @returns Array of link objects with target path, text, and context.
 */
export function extractWikiLinks(
  content: string,
  pageTitles: Map<string, string>,
  sourcePath: string,
  sourceTitle: string,
): Array<{
  targetPath: string;
  linkText: string;
  context: string;
}> {
  const results: Array<{
    targetPath: string;
    linkText: string;
    context: string;
  }> = [];

  const tracker = new OverlapTracker();
  const lines = content.split(/\r?\n/);

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    // 1. Wiki-style [[Page Title]] links
    const wikiPattern = /\[\[([^\]]+)\]\]/g;
    let wikiMatch: RegExpExecArray | null;
    while ((wikiMatch = wikiPattern.exec(line)) !== null) {
      const absoluteIdx = getAbsoluteIndex(lineIdx, lines) + wikiMatch.index;
      const title = wikiMatch[1].trim();
      const targetPath = resolveWikiLink(title, pageTitles);
      if (targetPath) {
        tracker.add(absoluteIdx, absoluteIdx + wikiMatch[0].length);
        results.push({
          targetPath,
          linkText: title,
          context: buildContext(content, absoluteIdx, wikiMatch[0], lineIdx, lines),
        });
      }
    }

    // 2. Markdown links [text](/pages/slug)
    const mdPattern = /\[([^\]]*)\]\(\s*\/pages\/([^)]+)\s*\)/g;
    let mdMatch: RegExpExecArray | null;
    while ((mdMatch = mdPattern.exec(line)) !== null) {
      const absoluteIdx = getAbsoluteIndex(lineIdx, lines) + mdMatch.index;
      const slug = mdMatch[2].replace(/\.md$/, '');
      const targetPath = `/pages/${slug}`;
      tracker.add(absoluteIdx, absoluteIdx + mdMatch[0].length);
      results.push({
        targetPath,
        linkText: mdMatch[1] || slug,
        context: buildContext(content, absoluteIdx, mdMatch[0], lineIdx, lines),
      });
    }

    // 3. Bare URLs: /pages/slug (not inside links)
    const barePattern = /(?<!\]\()\b\/pages\/([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)\b/g;
    let bareMatch: RegExpExecArray | null;
    while ((bareMatch = barePattern.exec(line)) !== null) {
      const absoluteIdx = getAbsoluteIndex(lineIdx, lines) + bareMatch.index;
      const endIdx = absoluteIdx + bareMatch[0].length;
      if (!tracker.overlaps(absoluteIdx, endIdx)) {
        const slug = bareMatch[1].replace(/\.md$/, '');
        const targetPath = `/pages/${slug}`;
        tracker.add(absoluteIdx, endIdx);
        results.push({
          targetPath,
          linkText: slug,
          context: buildContext(content, absoluteIdx, bareMatch[0], lineIdx, lines),
        });
      }
    }
  }

  return results;
}

/**
 * Calculate the absolute character index in `content` for a given line.
 */
function getAbsoluteIndex(lineIdx: number, lines: string[]): number {
  let idx = 0;
  for (let i = 0; i < lineIdx; i++) {
    idx += lines[i].length + 1; // +1 for newline
  }
  return idx;
}

/* ── Context Building ──────────────────────────────────────────────────── */

/**
 * Build a context snippet around the link, with the link text highlighted.
 */
function buildContext(
  content: string,
  linkPos: number,
  linkText: string,
  _lineIdx: number,
  _lines: string[],
): string {
  // Find the start of the surrounding text (~50 chars before)
  let startIdx = Math.max(0, linkPos - CONTEXT_CHARS);
  // Try to start at a word/punctuation boundary
  while (
    startIdx < linkPos &&
    !/^\s/.test(content[startIdx]) &&
    !/[\s,;:!?.\(\)\[\]\n]/.test(content[startIdx])
  ) {
    startIdx++;
  }

  // Find the end (~50 chars after)
  const linkEnd = linkPos + linkText.length;
  let endIdx = Math.min(content.length, linkEnd + CONTEXT_CHARS);
  while (
    endIdx > linkEnd &&
    endIdx < content.length &&
    !/\s/.test(content[endIdx])
  ) {
    endIdx++;
  }

  let snippet = content.slice(startIdx, endIdx);

  // Trim whitespace and ellipsis
  snippet = snippet.trim();

  // Add ellipsis if truncated
  const prefix = startIdx > 0 ? '…' : '';
  const suffix = endIdx < content.length ? '…' : '';

  // Highlight the link text within the snippet using HTML
  const escapedLink = escapeHtml(linkText);
  const highlighted = snippet.replace(
    new RegExp(escapeRegex(escapedLink), 'i'),
    `<mark class="bg-yellow-200 dark:bg-yellow-900/40 px-0.5 rounded">${escapedLink}</mark>`,
  );

  return `${prefix}${highlighted}${suffix}`;
}

/* ── Title Resolution ──────────────────────────────────────────────────── */

/**
 * Resolve a wiki link title to a page path via case-insensitive matching.
 */
function resolveWikiLink(
  title: string,
  pageTitles: Map<string, string>,
): string | null {
  const lower = title.toLowerCase();

  // Direct case-insensitive match against page titles
  for (const [path, pageTitle] of pageTitles) {
    if (pageTitle.toLowerCase() === lower) {
      return `/pages/${path.replace(/\.md$/, '').replace(/\.mdx$/, '')}`;
    }
  }

  // Try slug-based matching: convert title to slug and match against path
  const slugFromTitle = title
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  for (const [path, pageTitle] of pageTitles) {
    const slugFromPage = pageTitle
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (slugFromTitle === slugFromPage) {
      return `/pages/${path.replace(/\.md$/, '').replace(/\.mdx$/, '')}`;
    }
  }

  return null;
}

/* ── Backlink Index Builder ────────────────────────────────────────────── */

/**
 * Build a reverse backlink index from all pages.
 *
 * For each page slug, finds all pages that link to it and the context of each link.
 *
 * @param pages — Array of pages with path, title, and content.
 * @returns Map from target path to list of backlinks, cached module-wide.
 */
export function buildBacklinkIndex(
  pages: PageWithContent[],
): Map<string, Backlink[]> {
  // Build a title → path map for case-insensitive wiki link matching
  const pageTitles = new Map<string, string>();
  for (const page of pages) {
    pageTitles.set(page.title.toLowerCase(), page.path);
  }

  const index = new Map<string, Backlink[]>();

  // Collect all links from all pages
  const allLinks: Array<{
    targetPath: string;
    sourcePath: string;
    sourceTitle: string;
    context: string;
  }> = [];

  for (const page of pages) {
    const links = extractWikiLinks(
      page.content,
      pageTitles,
      page.path.replace(/\.md$/, '').replace(/\.mdx$/, ''),
      page.title,
    );
    for (const link of links) {
      allLinks.push({
        targetPath: link.targetPath,
        sourcePath: page.path.replace(/\.md$/, '').replace(/\.mdx$/, ''),
        sourceTitle: page.title,
        context: link.context,
      });
    }
  }

  // Build reverse index, deduplicating per target/source pair
  const seen = new Set<string>();
  for (const link of allLinks) {
    const key = `${link.targetPath}||${link.sourcePath}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const existing = index.get(link.targetPath);
    if (existing) {
      existing.push({
        sourcePath: link.sourcePath,
        sourceTitle: link.sourceTitle,
        context: link.context,
      });
    } else {
      index.set(link.targetPath, [
        {
          sourcePath: link.sourcePath,
          sourceTitle: link.sourceTitle,
          context: link.context,
        },
      ]);
    }
  }

  // Cache the result
  _cachedIndex = index;
  return index;
}

/* ── Public API ────────────────────────────────────────────────────────── */

/**
 * Get backlinks for a specific page slug from the cached index.
 *
 * Checks both with and without the `/pages/` prefix.
 */
export function getBacklinksForPage(
  targetSlug: string,
  index: Map<string, Backlink[]> = _cachedIndex ?? new Map(),
): Backlink[] {
  const normalized = targetSlug.replace(/^\/pages\//, '');
  const withPrefix = `/pages/${normalized}`;
  return index.get(withPrefix) || index.get(targetSlug) || [];
}

/**
 * Get the cached backlink index, if one exists.
 */
export function getCachedIndex(): Map<string, Backlink[]> | null {
  return _cachedIndex;
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
