import { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tag, ArrowLeft, FileText } from "lucide-react";
import { TagBadge } from "@/components/TagBadge";
import {
  getPagesByTag,
  slugifyTag,
  humanizeTag,
  tagColor,
} from "@/utils/tags";
import { usePages } from "@/hooks/useApiQuery";
import { useRelativeTime } from "@/hooks/useRelativeTime";

/* ── Component ────────────────────────────────────────────────────── */

/**
 * Single tag page at `/tags/:tag`.
 *
 * Features:
 * - Header: tag name with count
 * - List of all pages with this tag (same card style as PageList)
 * - "Browse all tags" link back to /tags
 * - Empty state
 */
export function TagPage(): React.ReactElement {
  const { tag: tagParam } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { data: pagesData, isLoading } = usePages();

  // Normalize the tag param
  const tagSlug = tagParam ? slugifyTag(tagParam) : "";
  const tagName = tagParam ? humanizeTag(tagSlug) : "";
  const tagColorValue = tagSlug ? tagColor(tagSlug) : "";

  // Get pages for this tag
  const taggedPages = useMemo(() => {
    if (!pagesData || !tagSlug) return [];
    const pages = pagesData.map((p) => ({
      slug: p.path,
      title: p.title,
      content: "", // page summaries don't include content
    }));
    return getPagesByTag(pages, tagSlug);
  }, [pagesData, tagSlug]);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="space-y-3 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate("/tags")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors mb-6 group"
        aria-label="Browse all tags"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        <span>Browse all tags</span>
      </button>

      {/* Tag header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${tagColorValue}22`,
            border: `1px solid ${tagColorValue}44`,
          }}
        >
          <Tag size={24} style={{ color: tagColorValue }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {tagName || tagSlug}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {taggedPages.length} page
            {taggedPages.length !== 1 ? "s" : ""} tagged with{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {tagName || tagSlug}
            </span>
          </p>
        </div>
      </div>

      {/* Tag badge */}
      {tagSlug && (
        <div className="mb-6">
          <TagBadge
            tag={tagSlug}
            tagInfo={{
              name: tagName || tagSlug,
              slug: tagSlug,
              count: taggedPages.length,
              color: tagColorValue,
            }}
            size="md"
          />
        </div>
      )}

      {/* Pages list */}
      {taggedPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <FileText
            size={40}
            className="mb-4 text-gray-300 dark:text-gray-600"
          />
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
            No pages with this tag yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Pages tagged with &ldquo;{tagName || tagSlug}&rdquo; will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {taggedPages.map((page) => (
            <button
              key={page.slug}
              onClick={() => handleNavigate(`/pages/${page.slug}`)}
              className="w-full text-left rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-700 dark:hover:bg-gray-800 group"
            >
              <div className="flex items-center gap-3">
                <FileText
                  size={18}
                  className="flex-shrink-0 text-gray-400 group-hover:text-indigo-500 dark:text-gray-500 dark:group-hover:text-indigo-400"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 dark:text-gray-100 dark:group-hover:text-indigo-300 truncate">
                    {page.title}
                  </h3>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {page.slug}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
