import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { slugToTag, filterPagesByTags } from "@/utils/tags";
import { useApiQuery } from "@/hooks/useApiQuery";
import { listPages } from "@/lib/api";
import type { WikiPage } from "@/types/tags";
import { TagBadge } from "./TagBadge";
import { ArrowLeft, FileText } from "lucide-react";

/**
 * Tag detail page — shows all pages that have a specific tag.
 */
export function TagPage(): React.ReactElement {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();

  if (!tag) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No tag specified.</p>
      </div>
    );
  }

  const displayName = slugToTag(tag);

  const { data: pages, isLoading, error } = useApiQuery<WikiPage[]>(
    ["all-pages"],
    () => listPages(),
    { staleTime: 60_000 }
  );

  const taggedPages = useMemo(() => {
    if (!pages) return [];
    // Convert to WikiPage[] with empty tags for now
    const wikiPages: WikiPage[] = pages.map((p) => ({
      id: p.path,
      title: p.title,
      slug: p.path.replace(/\.md$/, ""),
      path: p.path,
      modified: p.modified,
      tags: [],
    }));
    // Filter by the selected tag
    return filterPagesByTags(wikiPages, [tag]);
  }, [pages, tag]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <button
        onClick={() => navigate("/tags")}
        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={16} />
        Back to Tags
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <TagBadge label={displayName} removable={false} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {taggedPages.length} page{taggedPages.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Pages list */}
      {taggedPages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center dark:border-gray-700 dark:bg-gray-900/50">
          <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No pages found for tag &ldquo;{displayName}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {taggedPages.map((page) => (
            <div
              key={page.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-700 dark:hover:bg-gray-800"
            >
              <FileText className="h-5 w-5 shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {page.title}
                </h3>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {page.path}
                </p>
              </div>
              <button
                onClick={() => navigate(`/pages/${page.slug}`)}
                className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">Failed to load pages: {error}</p>
      )}
    </div>
  );
}
