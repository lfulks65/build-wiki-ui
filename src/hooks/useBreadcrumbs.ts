import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { titleCase } from "@/utils/slug";

// ── Types ──────────────────────────────────────────────────────────

export interface Breadcrumb {
  /** Human-readable label */
  label: string;
  /** Link path — undefined for the current (last) crumb */
  path?: string;
}

// ── Known routes ───────────────────────────────────────────────────

/**
 * Map of top-level route segments to their human-readable names.
 * Unknown segments fall back to `titleCase()`.
 */
const KNOWN_ROUTES: Record<string, string> = {
  pages: "Pages",
  assets: "Assets",
  search: "Search",
  curator: "Curator",
  settings: "Settings",
  docs: "Docs",
  about: "About",
  favorites: "Starred",
};

// ── Hook ───────────────────────────────────────────────────────────

/**
 * Returns an array of breadcrumb segments derived from the current URL.
 *
 * Behaviour:
 *  - The root `/` returns an empty array (no breadcrumbs on the home page).
 *  - For `/pages/api-reference/getting-started` the result is:
 *      [
 *        { label: "Pages",   path: "/pages" },
 *        { label: "Api Reference", path: "/pages/api-reference" },
 *        { label: "Getting Started" },  ← last item has no path (current page)
 *      ]
 *  - Known top-level segments (pages, assets, search, etc.) use the
 *    predefined human-readable label; everything else goes through `titleCase()`.
 */
export function useBreadcrumbs(): Breadcrumb[] {
  const { pathname } = useLocation();

  return useMemo(() => {
    // Remove leading slash and split; ignore empty segments
    const segments = pathname.replace(/^\/+/, "").split("/").filter(Boolean);

    if (segments.length === 0) return [];

    return segments.map((segment, index) => {
      const isLast = index === segments.length - 1;
      const fullPath = "/" + segments.slice(0, index + 1).join("/");
      const label =
        index === 0
          ? KNOWN_ROUTES[segment] ?? titleCase(segment)
          : titleCase(segment);

      return isLast
        ? { label }
        : { label, path: fullPath };
    });
  }, [pathname]);
}
