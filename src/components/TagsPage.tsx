import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllTags, slugifyTag } from "@/utils/tags";
import { useApiQuery } from "@/hooks/useApiQuery";
import { listPages } from "@/lib/api";
import type { WikiPage } from "@/types/tags";
import { TagBadge } from "./TagBadge";

/**
 * Tags overview page — shows a tag cloud linking to per-tag pages.
 */
export function TagsPage(): React.ReactElement {
  const navigate = useNavigate();

  const { data: pages, isLoading, error } = useApiQuery<WikiPage[]>(
    ["all-pages"],
    () => listPages(),
    { staleTime: 60_000 }
  );

  const allTags = useMemo(() => {
    if (!pages) return [];
    // Convert PageSummary[] to WikiPage[] with empty tags so getAllTags works
    const wikiPages: WikiPage[] = pages.map((p) => ({
      id: p.path,
      title: p.title,
      slug: p.path.replace(/\.md$/, ""),
      path: p.path,
      modified: p.modified,
      tags: [],
    }));
    return getAllTags(wikiPages);
  }, [pages]);

  // Compute font size class based on tag count rank
  const getFontSize = (count: number, maxCount: number): string => {
    if (maxCount === 0) return "text-sm";
    const ratio = count / maxCount;
    if (ratio > 0.7) return "text-lg font-semibold";
    if (ratio > 0.4) return "text-base font-medium";
    return "text-sm";
  };

  const maxCount = allTags.length > 0 ? allTags[0].count : 1;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Failed to load tags.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Tags
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Browse pages by tag. There are {allTags.length} unique tags.
        </p>
      </div>

      {allTags.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tags yet. Add tags to your pages in the editor to see them here.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          {allTags.map((tag) => (
            <button
              key={tag.slug}
              onClick={() => navigate(`/tags/${tag.slug}`)}
              className={`
                rounded-full transition-colors duration-150
                hover:bg-indigo-50 hover:text-indigo-600
                dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400
                ${getFontSize(tag.count, maxCount)}
                text-gray-700 dark:text-gray-300
              `}
            >
              <TagBadge label={tag.name} removable={false} />
            </button>
          ))}
        </div>
      )}

      {/* Compact list of tagged pages */}
      {pages && pages.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            All Pages
          </h2>
          <div className="mt-2 space-y-1">
            {pages.map((p) => (
              <div
                key={p.path}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
              >
                <span className="truncate">{p.title}</span>
                <span className="text-xs text-gray-400">/ {p.path}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
