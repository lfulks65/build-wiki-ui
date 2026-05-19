/**
 * Convert a heading title into a URL-friendly slug ID.
 * Used by both MarkdownRenderer (to generate heading IDs) and
 * TableOfContents (to match headings → scrollspy IDs).
 *
 * Rules:
 *  - Lowercase the entire string
 *  - Replace spaces, underscores, and tabs with hyphens
 *  - Strip non-alphanumeric characters (keep hyphens)
 *  - Collapse consecutive hyphens into one
 *  - Trim leading / trailing hyphens
 *
 * @example
 *   slugify("Getting Started")     // "getting-started"
 *   slugify("API Reference v2!")   // "api-reference-v2"
 *   slugify("What is Build Wiki?") // "what-is-build-wiki"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s_]+/g, "-")          // spaces & underscores → hyphens
    .replace(/[^a-z0-9-]/g, "")       // strip non-alphanumeric (keep hyphens)
    .replace(/-+/g, "-")              // collapse consecutive hyphens
    .replace(/^-|-$/g, "");           // trim leading/trailing hyphens
}

/**
 * Convert a kebab-case / URL slug into a human-readable title.
 *
 * @example
 *   titleCase("getting-started")       // "Getting Started"
 *   titleCase("api-reference")         // "Api Reference"
 *   titleCase("my-UI-component")       // "My UI Component"
 *   titleCase("")                       // ""
 */
export function titleCase(slug: string): string {
  const cleaned = slug.replace(/^-|-$/g, "");
  if (!cleaned) return "";

  return cleaned
    .split("-")
    .map((segment) => {
      if (!segment) return "";
      // Preserve mixed-case segments like "UI" or "v2" as-is if they contain
      // uppercase letters already; otherwise capitalize first letter.
      if (/[A-Z]/.test(segment)) return segment;
      return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    })
    .join(" ");
}
