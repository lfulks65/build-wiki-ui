/**
 * BacklinksPanel — collapsible "What Links Here" panel.
 *
 * Renders below page content in the PageViewer, showing all pages
 * that link to the current page. Supports [[wiki links]] and
 * [markdown links](/pages/slug) formats.
 */

import { useState, useCallback } from 'react';
import { Link2, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { useBacklinks } from '@/hooks/useBacklinks';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/Skeleton';

/* ── Props ─────────────────────────────────────────────────────────────── */

interface BacklinksPanelProps {
  /** The slug of the current page (e.g., "getting-started"). */
  pageSlug: string;
}

/* ── Component ─────────────────────────────────────────────────────────── */

export function BacklinksPanel({ pageSlug }: BacklinksPanelProps): React.ReactElement {
  const { backlinks, loading, error, refresh, totalCount } = useBacklinks(pageSlug);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const hasBacklinks = totalCount > 0;

  // Default to expanded when there are backlinks
  const isCollapsed = collapsed || !hasBacklinks;

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  const handleNavigate = useCallback(
    (sourcePath: string) => {
      navigate(`/pages/${sourcePath}`);
    },
    [navigate],
  );

  /* ── Loading state ─────────────────────────────────────────────────── */

  if (loading && !hasBacklinks) {
    return (
      <section
        className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-4"
        aria-label="Loading backlinks"
      >
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Scanning pages for links…</span>
        </div>
        <div className="space-y-3">
          <Skeleton variant="card" count={2} className="h-16" />
        </div>
      </section>
    );
  }

  /* ── Error state ───────────────────────────────────────────────────── */

  if (error && !hasBacklinks) {
    return (
      <section
        className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-4"
        aria-label="Backlinks error"
      >
        <BacklinksHeader
          title="What Links Here"
          count={0}
          collapsed={true}
          onToggle={toggle}
        />
        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          <div className="flex items-center justify-between">
            <span>Failed to load backlinks: {error}</span>
            <button
              onClick={refresh}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              aria-label="Retry loading backlinks"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ── Empty state ───────────────────────────────────────────────────── */

  if (!hasBacklinks && !loading) {
    return (
      <section
        className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-4"
        aria-label="No backlinks"
      >
        <BacklinksHeader
          title="What Links Here"
          count={0}
          collapsed={true}
          onToggle={toggle}
        />
        <div className="mt-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            No pages link here yet. Create a link from another page using:{' '}
            <code className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
              [[Page Title]]
            </code>{' '}
            or{' '}
            <code className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
              [link text](/pages/slug)
            </code>
            .
          </p>
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            You can also view{' '}
            <button
              onClick={() => navigate(`/pages/${pageSlug}/backlinks`)}
              className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              all backlinks
            </button>
            {' '}for this page.
          </div>
        </div>
      </section>
    );
  }

  /* ── Backlinks list ────────────────────────────────────────────────── */

  return (
    <section
      className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-4"
      aria-label="Backlinks"
    >
      <BacklinksHeader
        title="What Links Here"
        count={totalCount}
        collapsed={isCollapsed}
        onToggle={toggle}
      />

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}
        `}
      >
        <div className="mt-3 space-y-2">
          {backlinks.map((bl, idx) => (
            <BacklinkItem
              key={`${bl.sourcePath}-${idx}`}
              backlink={bl}
              onClick={handleNavigate}
            />
          ))}

          {/* Link to full backlinks page */}
          <div className="pt-2">
            <button
              onClick={() => navigate(`/pages/${pageSlug}/backlinks`)}
              className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors font-medium"
            >
              View all {totalCount} link{totalCount !== 1 ? 's' : ''} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Header ────────────────────────────────────────────────────────────── */

interface BacklinksHeaderProps {
  title: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
}

function BacklinksHeader({ title, count, collapsed, onToggle }: BacklinksHeaderProps): React.ReactElement {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 group cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 rounded-lg px-1 -ml-1"
      aria-expanded={!collapsed}
      aria-controls="backlinks-content"
    >
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
          {title}
        </h3>
        {count > 0 && (
          <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {count}
          </span>
        )}
      </div>
      {collapsed ? (
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      ) : (
        <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      )}
    </button>
  );
}

/* ── Backlink Item ─────────────────────────────────────────────────────── */

interface BacklinkItemProps {
  backlink: {
    sourcePath: string;
    sourceTitle: string;
    context: string;
  };
  onClick: (path: string) => void;
}

function BacklinkItem({ backlink, onClick }: BacklinkItemProps): React.ReactElement {
  return (
    <div
      className="
        group/item
        p-3 rounded-lg border border-gray-200 bg-white
        hover:border-indigo-300 hover:shadow-sm
        dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-indigo-700 dark:hover:bg-gray-900/80
        transition-all duration-150 cursor-pointer
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
      aria-label={`Link from "${backlink.sourceTitle}"`}
    >
      {/* Source page title */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <svg
          className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0"
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
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
          {backlink.sourceTitle}
        </span>
      </div>

      {/* Context snippet with highlighted link */}
      <div
        className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed overflow-hidden"
        dangerouslySetInnerHTML={{ __html: backlink.context }}
      />
    </div>
  );
}
