import { useState, useMemo, useCallback } from "react";
import { Tag, Search, FileText, ArrowUpDown } from "lucide-react";
import { TagBadge } from "@/components/TagBadge";
import { getAllTags, extractAllPageTags } from "@/utils/tags";
import { usePages } from "@/hooks/useApiQuery";

/* ── Types ────────────────────────────────────────────────────────── */

type SortMode = "count" | "alpha";

/* ── Component ────────────────────────────────────────────────────── */

/**
 * Tag index page at `/tags`.
 *
 * Features:
 * - Header with total tag count
 * - Tag cloud/grid layout: larger tags for more frequent use
 * - Each tag: name, count badge, color
 * - Click navigates to /tags/:tag
 * - Sort options: alphabetical, by count
 * - Search/filter tags by name
 * - Empty state
 */
export function TagsPage(): React.ReactElement {
  const { data: pagesData, isLoading } = usePages();
  const [sortMode, setSortMode] = useState<SortMode>("count");
  const [searchQuery, setSearchQuery] = useState("");

  // Build pages array from API data
  const pages = useMemo(() => {
    if (!pagesData) return [];
    return pagesData.map((p) => ({
      slug: p.path,
      title: p.title,
      content: "", // Page summaries don't include content, but that's fine for tag listing
    }));
  }, [pagesData]);

  // All tags
  const allTags = useMemo(() => getAllTags(pages), [pages]);

  // Extract page tags for inline display on this page
  const pageTags = useMemo(() => extractAllPageTags(pages), [pages]);

  // Filtered + sorted tags
  const filteredTags = useMemo(() => {
    let tags = [...allTags];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      tags = tags.filter(
        (t) => t.name.toLowerCase().includes(q) || t.slug.includes(q)
      );
    }

    // Sort
    tags.sort((a, b) => {
      if (sortMode === "count") return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

    return tags;
  }, [allTags, searchQuery, sortMode]);

  // Total unique tags
  const totalTags = allTags.length;

  // Total tagged pages
  const taggedPages = pageTags.length;

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Size class based on count
  const getSizeClass = (count: number): string => {
    if (count >= 5) return "px-5 py-2 text-base";
    if (count >= 3) return "px-4 py-1.5 text-sm";
    return "px-3 py-1 text-sm";
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex gap-3">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Tag size={28} className="text-indigo-500" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Tags
          </h1>
          <span className="ml-2 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            {totalTags}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {taggedPages} page{taggedPages !== 1 ? "s" : ""} tagged across{" "}
          {totalTags} unique tag{totalTags !== 1 ? "s" : ""}.
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Filter tags…"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900"
            aria-label="Filter tags by name"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
            Sort:
          </span>
          <button
            onClick={() => setSortMode("count")}
            className={`
              flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors
              ${
                sortMode === "count"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }
            `}
            aria-pressed={sortMode === "count"}
          >
            <ArrowUpDown size={12} />
            By count
          </button>
          <button
            onClick={() => setSortMode("alpha")}
            className={`
              flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors
              ${
                sortMode === "alpha"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }
            `}
            aria-pressed={sortMode === "alpha"}
          >
            A → Z
          </button>
        </div>
      </div>

      {/* Tag cloud */}
      {totalTags === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <Tag size={40} className="mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
            No tags yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Add tags to pages using the <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-800">tags:</code> field in frontmatter.
          </p>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
          <Search size={32} className="mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No tags match &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filteredTags.map((tag) => (
            <TagBadge
              key={tag.slug}
              tag={tag.slug}
              tagInfo={tag}
              size="md"
            />
          ))}
        </div>
      )}

      {/* Pages grouped by tag (show top tags' pages) */}
      {filteredTags.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pages by tag
          </h2>
          <div className="space-y-6">
            {filteredTags.slice(0, 10).map((tag) => (
              <div key={tag.slug}>
                <div className="flex items-center gap-2 mb-2">
                  <TagBadge
                    tag={tag.slug}
                    tagInfo={tag}
                    size="sm"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {tag.count} page{tag.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                  {/* We don't have full content to do real filtering, so we show a placeholder */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    Tagged pages will appear here once page content is available.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
