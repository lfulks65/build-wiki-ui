/**
 * BacklinksPage — dedicated full-page view of all backlinks for a given page.
 *
 * Route: `/pages/:slug/backlinks`
 *
 * Features:
 * - Header with page title and backlink count
 * - Sortable list (by title or modification date)
 * - Card per backlink with source page title, context, and navigation
 * - Loading skeleton, error, and empty states
 * - Dark mode compatible
 */

import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, SortAsc, SortDesc, Loader2, ExternalLink } from 'lucide-react';
import { useBacklinks } from '@/hooks/useBacklinks';
import { titleCase } from '@/utils/slug';
import { Skeleton } from '@/components/Skeleton';

/* ── Sort options ──────────────────────────────────────────────────────── */

type SortOption = 'title' | 'path';
type SortDirection = 'asc' | 'desc';

/* ── Component ─────────────────────────────────────────────────────────── */

export function BacklinksPage(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const pageSlug = slug || '';
  const pageTitle = titleCase(pageSlug);

  const { backlinks, loading, error, refresh, totalCount } = useBacklinks(pageSlug);

  const [sortOption, setSortOption] = useState<SortOption>('title');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  /* ── Sorted backlinks ────────────────────────────────────────────────── */

  const sortedBacklinks = useMemo(() => {
    if (backlinks.length === 0) return backlinks;

    const sorted = [...backlinks].sort((a, b) => {
      let cmp = 0;
      if (sortOption === 'title') {
        cmp = a.sourceTitle.localeCompare(b.sourceTitle);
      } else {
        cmp = a.sourcePath.localeCompare(b.sourcePath);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [backlinks, sortOption, sortDir]);

  const handleSort = useCallback(
    (option: SortOption) => {
      if (sortOption === option) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortOption(option);
        setSortDir('asc');
      }
    },
    [sortOption],
  );

  const handleNavigate = useCallback(
    (sourcePath: string) => {
      navigate(`/pages/${sourcePath}`);
    },
    [navigate],
  );

  /* ── Loading state ─────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Scanning pages for links…</span>
        </div>
        <div className="space-y-4">
          <Skeleton variant="card" count={5} className="h-28" />
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────────────────────── */

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BacklinksPageHeader
          title={pageTitle}
          count={0}
          onBack={() => navigate(`/pages/${pageSlug}`)}
        />
        <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          <div className="flex items-center justify-between">
            <span>Failed to load backlinks: {error}</span>
            <button
              onClick={refresh}
              className="text-xs font-medium text-red-500 hover:text-red-600 dark:hover:text-red-300 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Empty state ───────────────────────────────────────────────────── */

  if (totalCount === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BacklinksPageHeader
          title={pageTitle}
          count={0}
          onBack={() => navigate(`/pages/${pageSlug}`)}
        />
        <div className="mt-6 p-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No pages link here yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Create a link from another page using{' '}
            <code className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
              [[{pageTitle}]]
            </code>{' '}
            or{' '}
            <code className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
              [link text](/pages/{pageSlug})
            </code>
            .
          </p>
        </div>
      </div>
    );
  }

  /* ── Results list ──────────────────────────────────────────────────── */

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <BacklinksPageHeader
        title={pageTitle}
        count={totalCount}
        onBack={() => navigate(`/pages/${pageSlug}`)}
      />

      {/* Sort controls */}
      <div className="flex items-center gap-2 mt-4 mb-4">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sort:</span>
        <button
          onClick={() => handleSort('title')}
          className={`
            flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors
            ${
              sortOption === 'title'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }
          `}
          aria-label={`Sort by title ${sortDir === 'asc' ? 'ascending' : 'descending'}`}
        >
          Title
          {sortOption === 'title' && (
            sortDir === 'desc' ? (
              <SortDesc className="w-3 h-3" />
            ) : (
              <SortAsc className="w-3 h-3" />
            )
          )}
        </button>
        <button
          onClick={() => handleSort('path')}
          className={`
            flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors
            ${
              sortOption === 'path'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }
          `}
          aria-label={`Sort by path ${sortDir === 'asc' ? 'ascending' : 'descending'}`}
        >
          Path
          {sortOption === 'path' && (
            sortDir === 'desc' ? (
              <SortDesc className="w-3 h-3" />
            ) : (
              <SortAsc className="w-3 h-3" />
            )
          )}
        </button>
      </div>

      {/* Backlinks list */}
      <div className="space-y-3">
        {sortedBacklinks.map((bl, idx) => (
          <BacklinkCard
            key={`${bl.sourcePath}-${idx}`}
            backlink={bl}
            onClick={handleNavigate}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Header ────────────────────────────────────────────────────────────── */

interface BacklinksPageHeaderProps {
  title: string;
  count: number;
  onBack: () => void;
}

function BacklinksPageHeader({ title, count, onBack }: BacklinksPageHeaderProps): React.ReactElement {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        aria-label="Go back to page"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Pages linking to &ldquo;{title}&rdquo;
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {count} page{count !== 1 ? 's' : ''} link here
        </p>
      </div>
    </div>
  );
}

/* ── Backlink Card ─────────────────────────────────────────────────────── */

interface BacklinkCardProps {
  backlink: {
    sourcePath: string;
    sourceTitle: string;
    context: string;
  };
  onClick: (path: string) => void;
}

function BacklinkCard({ backlink, onClick }: BacklinkCardProps): React.ReactElement {
  return (
    <div
      className="
        group/item
        p-4 rounded-xl border border-gray-200 bg-white
        hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5
        dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-indigo-700 dark:hover:bg-gray-900/80
        transition-all duration-200 cursor-pointer
      "
      onClick={() => onClick(backlink.sourcePath)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(backlink.sourcePath);
        }
      }}
    >
      {/* Source header */}
      <div className="flex items-center gap-2 mb-2.5">
        <svg
          className="w-4 h-4 text-indigo-400 dark:text-indigo-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
          {backlink.sourceTitle}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono ml-auto">
          {backlink.sourcePath}
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover/item:text-indigo-400 opacity-0 group-hover/item:opacity-100 transition-all" />
      </div>

      {/* Context snippet with highlighted link */}
      <div
        className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed overflow-hidden"
        dangerouslySetInnerHTML={{ __html: backlink.context }}
      />
    </div>
  );
}
