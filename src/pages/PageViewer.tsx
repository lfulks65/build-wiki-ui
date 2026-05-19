/* ── PageViewer — renders a single wiki page from API ────────────── */

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { readPage } from "@/lib/api";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Skeleton } from "@/components/Skeleton";

export function PageViewer(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>() ?? {};

  // slug in the route can be "pages/:slug", so we need to find the actual
  // slug. The URL pattern is `/pages/:slug`, so slug will be the path segment.
  const pageSlug = slug?.replace(/\.md$/, "");

  const { data: content, isLoading, error, refetch } = useQuery({
    queryKey: ["page", pageSlug],
    queryFn: () => readPage(pageSlug ?? ""),
    enabled: !!pageSlug,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton variant="card" />
        <div className="mt-4 space-y-3">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-red-600 dark:text-red-400">
          Failed to load page
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {error.message}
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => refetch()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Try again
          </button>
          <Link
            to="/pages"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Back to pages
          </Link>
        </div>
      </div>
    );
  }

  // Not found
  if (!content) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Page not found
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          "{pageSlug}" does not exist in the wiki.
        </p>
        <Link
          to="/pages"
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Browse all pages
        </Link>
      </div>
    );
  }

  // Render page content
  return <MarkdownRenderer content={content} />;
}
