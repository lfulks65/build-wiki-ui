import { useState } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { readPage } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";
import MarkdownRenderer, { extractFrontmatter } from "@/components/MarkdownRenderer";

/* ── Sub-components ────────────────────────────────────────────────── */

function PageViewerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="Loading content">
      <div className="skeleton skeleton-line h-8 w-3/4" />
      <div className="skeleton skeleton-line w-full" />
      <div className="skeleton skeleton-line w-5/6" />
      <div className="skeleton skeleton-line w-full" />
      <div className="skeleton skeleton-line h-6 w-1/2" />
      <div className="skeleton skeleton-line w-4/5" />
      <div className="skeleton skeleton-line w-3/4" />
      <div className="skeleton skeleton-line h-32 w-full" />
      <div className="skeleton skeleton-line w-full" />
      <div className="skeleton skeleton-line h-6 w-2/3" />
      <div className="skeleton skeleton-line w-full" />
      <div className="skeleton skeleton-line w-5/6" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="error-state max-w-lg mx-auto">
      <svg
        className="w-12 h-12 mx-auto mb-4 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
        Failed to load page
      </h3>
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Try Again
      </button>
    </div>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <div className="empty-state max-w-md mx-auto">
      <svg
        className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 0 01.707.293l5.414 5.414a1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">
        Page not found
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500">{message}</p>
    </div>
  );
}

/** Page title header with favorite toggle (mirrors component UI). */
function PageHeader({ title, slug }: { title: string; slug?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [justToggled, setJustToggled] = useState(false);
  const favored = slug ? isFavorite(slug) : false;

  const handleClick = () => {
    if (!slug) return;
    toggleFavorite(slug, title);
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 200);
  };

  return (
    <div className="mb-4 flex items-start justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
      <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {slug && (
        <button
          onClick={handleClick}
          className={`
            flex items-center justify-center rounded-full p-1.5
            text-gray-400 transition-colors duration-150
            hover:bg-indigo-50 hover:text-indigo-500
            dark:text-gray-500 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400
            ${favored ? "text-indigo-500" : ""}
          `}
          aria-label={favored ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favored}
          title={favored ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            size={20}
            className={`
              transition-transform duration-200
              ${justToggled ? "scale-110" : "scale-100"}
              ${favored ? "fill-indigo-500" : ""}
            `}
            style={
              favored
                ? { filter: "drop-shadow(0 0 3px rgba(99,102,241,0.5))" }
                : undefined
            }
          />
        </button>
      )}
    </div>
  );
}

/* ── Route component (default + named for App.tsx) ─────────────────── */

function PageViewer() {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: content,
    isLoading,
    error,
    refetch,
  } = useApiQuery<string>(
    ["page", slug],
    () => readPage(slug!),
    { suspense: false }
  );

  if (isLoading) return <PageViewerSkeleton />;
  if (error) return <ErrorState message="Failed to load page" onRetry={refetch} />;
  if (!content) return <NotFound message="No content found for this page." />;

  // Extract title from frontmatter or fall back to slug
  const { frontmatter, body } = extractFrontmatter(content);
  const title = frontmatter?.title || slug || "Untitled";

  return (
    <div className="w-full">
      <PageHeader title={title} slug={slug} />
      <MarkdownRenderer content={body} className="w-full" />
    </div>
  );
}

/** Named export used by App.tsx for the /pages/:slug route. */
export function PageViewerRoute() {
  return <PageViewer />;
}

export default PageViewer;
