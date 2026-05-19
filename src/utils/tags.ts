/**
 * Tag utility functions.
 */

import type { WikiPage, Tag, TagWithSlug } from "@/types/tags";

/**
 * Convert a tag name to a URL-friendly slug.
 */
export function slugifyTag(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Slugify back to a display name.
 */
export function slugToTag(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Extract all unique tags from an array of pages and compute frequencies.
 */
export function getAllTags(pages: WikiPage[]): TagWithSlug[] {
  const tagMap = new Map<string, number>();

  for (const page of pages) {
    for (const tag of page.tags ?? []) {
      const key = tag.toLowerCase();
      tagMap.set(key, (tagMap.get(key) ?? 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({
      name: tagToDisplay(name),
      slug: name,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Convert a lowercase tag to display format.
 */
function tagToDisplay(lower: string): string {
  return lower
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Filter pages to only those containing any of the given selected tags.
 */
export function filterPagesByTags(
  pages: WikiPage[],
  selectedTags: string[]
): WikiPage[] {
  if (selectedTags.length === 0) return pages;

  return pages.filter((page) => {
    const pageTags = (page.tags ?? []).map((t) => t.toLowerCase());
    return selectedTags.some((st) => pageTags.includes(st));
  });
}
