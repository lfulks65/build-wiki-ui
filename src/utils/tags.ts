/**
 * Tag utilities — extract, normalize, index, and query tags from wiki pages.
 *
 * Tags are stored in YAML frontmatter of markdown pages using the `tags:` field.
 * Supports both inline array syntax (`tags: [api, reference]`) and list syntax
 * (`tags:\n  - api\n  - reference`).
 *
 * @module utils/tags
 */

import type { TagInfo, PageTags } from "@/types/tags";

/* ── YAML frontmatter extraction ──────────────────────────────────── */

/**
 * Extract raw text between `---` delimiters at the start of a document.
 * Returns the frontmatter body (without the `---` lines).
 */
function extractFrontmatter(content: string): string | null {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith("---")) return null;

  const afterFirst = trimmed.slice(3);
  const endIdx = afterFirst.indexOf("---");
  if (endIdx === -1) return null;

  return afterFirst.slice(0, endIdx).trim();
}

/**
 * Parse a YAML `tags:` value into an array of raw tag strings.
 *
 * Supports:
 *   - Inline: `tags: [api, reference, getting-started]`
 *   - List: `tags:\n  - api\n  - reference`
 *   - Quoted: `tags: ["api", "getting-started"]`
 *   - Single: `tags: api`
 */
function parseTagsField(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  // Inline array: [tag1, tag2, tag3]
  const inlineMatch = trimmed.match(/^\[(.+)\]$/s);
  if (inlineMatch) {
    return inlineMatch[1]
      .split(",")
      .map((t) => normalizeTagName(t.trim()))
      .filter(Boolean);
  }

  // Quoted inline: ["tag1", "tag2"]
  const quotedMatch = trimmed.match(/^"\[(.+)\]"/s);
  if (quotedMatch) {
    return quotedMatch[1]
      .split(",")
      .map((t) => normalizeTagName(t.trim().replace(/^"|"$/g, "")))
      .filter(Boolean);
  }

  // List items: - tag1\n- tag2
  const lines = trimmed.split("\n");
  const listTags: string[] = [];
  for (const line of lines) {
    const dashMatch = line.trim().match(/^-+\s+(.+)/);
    if (dashMatch) {
      const t = normalizeTagName(dashMatch[1].trim().replace(/^"|"$/g, ""));
      if (t) listTags.push(t);
    }
  }
  if (listTags.length > 0) return listTags;

  // Single tag (no brackets, no dashes)
  const single = normalizeTagName(trimmed.replace(/^"|"$/g, ""));
  if (single) return [single];

  return [];
}

/**
 * Extract tags from YAML frontmatter.
 *
 * @param content — Full markdown document (with optional frontmatter).
 * @returns Array of raw tag name strings.
 */
export function extractTagsFromFrontmatter(content: string): string[] {
  const fm = extractFrontmatter(content);
  if (!fm) return [];

  const lines = fm.split("\n");
  let inTags = false;
  let tagsValue = "";

  for (const line of lines) {
    // Detect tags: line
    const tagMatch = line.match(/^tags:\s*(.*)/i);
    if (tagMatch) {
      inTags = true;
      const afterColon = tagMatch[1].trim();
      if (afterColon) {
        tagsValue = afterColon;
        // If it's a complete inline array on one line, return immediately
        if (afterColon.match(/^\[.*\]$/)) {
          return parseTagsField(afterColon);
        }
      }
      continue;
    }

    if (inTags) {
      // Check if this is a list continuation line
      if (line.trim().match(/^-\s+/)) {
        tagsValue += "\n" + line;
        continue;
      }
      // Check if it's another top-level key (end of tags)
      if (line.trim() && !line.startsWith(" ") && !line.startsWith("\t") && !line.trim().startsWith("-")) {
        break;
      }
      // Indented continuation of list items
      if (line.trim().match(/^[\s-]+/) && line.trim().match(/^-/)) {
        tagsValue += "\n" + line;
      } else {
        // Other indented content — end of tags block
        break;
      }
    }
  }

  if (!tagsValue) return [];
  return parseTagsField(tagsValue);
}

/* ── Tag normalization ────────────────────────────────────────────── */

/**
 * Normalize a tag name to a slug: lowercase, trim, replace spaces with hyphens.
 */
export function slugifyTag(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Normalize a tag name for display: title-case, spaces instead of hyphens.
 */
export function humanizeTag(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* ── Tag hashing for consistent colors ────────────────────────────── */

/**
 * Generate a consistent hex color from a tag name using a simple hash.
 * Uses HSL for better visual results — varies hue, keeps saturation/lightness moderate.
 */
export function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 70%)`;
}

/* ── Tag index building ───────────────────────────────────────────── */

/**
 * Build a tag index from all pages.
 *
 * @param pages — Array of pages with slug, title, and content.
 * @returns Map of tag slug → TagInfo.
 */
export function buildTagIndex(
  pages: Array<{ slug: string; title: string; content: string }>
): Map<string, TagInfo> {
  const tagMap = new Map<string, { slugs: string[]; titles: string[] }>();

  for (const page of pages) {
    const tags = extractTagsFromFrontmatter(page.content);
    for (const rawTag of tags) {
      const slug = slugifyTag(rawTag);
      if (!slug) continue;
      const entry = tagMap.get(slug) ?? { slugs: [], titles: [] };
      entry.slugs.push(page.slug);
      entry.titles.push(page.title);
      tagMap.set(slug, entry);
    }
  }

  const result = new Map<string, TagInfo>();
  for (const [slug, data] of tagMap) {
    result.set(slug, {
      name: humanizeTag(slug),
      slug,
      count: data.slugs.length,
      color: tagColor(slug),
    });
  }

  return result;
}

/**
 * Get all tags sorted by usage count (most used first).
 * Falls back to alphabetical when counts are equal.
 */
export function getAllTags(
  pages: Array<{ slug: string; title: string; content: string }>
): TagInfo[] {
  const index = buildTagIndex(pages);
  return Array.from(index.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get all pages that have a specific tag.
 */
export function getPagesByTag(
  pages: Array<{ slug: string; title: string; content: string }>,
  tag: string
): Array<{ slug: string; title: string }> {
  const slug = slugifyTag(tag);
  return pages
    .filter((p) => {
      const tags = extractTagsFromFrontmatter(p.content);
      return tags.some((t) => slugifyTag(t) === slug);
    })
    .map((p) => ({ slug: p.slug, title: p.title }));
}

/**
 * Extract all page-tag associations.
 */
export function extractAllPageTags(
  pages: Array<{ slug: string; title: string; content: string }>
): PageTags[] {
  return pages
    .map((p) => {
      const tags = extractTagsFromFrontmatter(p.content);
      return { pageSlug: p.slug, pageTitle: p.title, tags };
    })
    .filter((pt) => pt.tags.length > 0);
}
