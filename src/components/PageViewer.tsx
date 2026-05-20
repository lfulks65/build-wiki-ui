import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Star, Edit2, Trash2, Clock, AlertCircle,
  RefreshCw, Copy, Check, Tag as TagIcon
} from 'lucide-react';
import { readPage } from '@/lib/api';
import { useFavorites } from '@/hooks/useFavorites';
import { useRelativeTime } from '@/hooks/useRelativeTime';
import { extractFrontmatter } from './MarkdownRenderer';
import { BacklinksPanel } from './BacklinksPanel';
import { TagBadge } from './TagBadge';
import { Skeleton } from './Skeleton';
import MarkdownRenderer from './MarkdownRenderer';

/* ── Types ─────────────────────────────────────────────────────────── */

interface PageViewerProps {
  pageTitle?: string;
  pageSlug?: string;
}

interface PageData {
  content: string;
  frontmatter: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

/* ── Helpers ───────────────────────────────────────────────────────── */

/** Estimate reading time in minutes from raw text. */
function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Generate a canonical link for the current page. */
function getPageLink(slug: string): string {
  return `${window.location.origin}/pages/${slug}`;
}

/* ── Confirmation Dialog ───────────────────────────────────────────── */

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3
              id="confirm-title"
              className="text-base font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 404 State ─────────────────────────────────────────────────────── */

function NotFoundState({ onGoBack }: { onGoBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20">
          <span className="text-4xl font-bold text-red-400">404</span>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Page not found
      </h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <button
        onClick={onGoBack}
        className="mt-6 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Back to pages
      </button>
    </div>
  );
}

/* ── Page Header ───────────────────────────────────────────────────── */

function PageHeader({
  title,
  slug,
  lastModified,
  readingTime,
  tags,
  onEdit,
  onDelete,
}: {
  title: string;
  slug?: string;
  lastModified?: string;
  readingTime?: number;
  tags?: string[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [justToggled, setJustToggled] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const relativeTime = useRelativeTime(lastModified);

  const favored = slug ? isFavorite(slug) : false;

  const handleToggleFav = () => {
    if (!slug) return;
    toggleFavorite(slug, title);
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 200);
  };

  const handleCopy = async () => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(getPageLink(slug));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = getPageLink(slug);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {title}
          </h1>

          {/* Meta row: time, reading time, tags */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {lastModified && relativeTime && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                Last modified{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {relativeTime}
                </span>
              </span>
            )}

            {readingTime && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                {readingTime} min read
              </span>
            )}

            {tags && tags.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <TagIcon className="h-3 w-3" />
                {tags.length} tag{tags.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Tags row */}
          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <TagBadge key={tag} label={tag} removable={false} />
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          className="flex items-center gap-1"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Favorite */}
          {slug && (
            <button
              onClick={handleToggleFav}
              className={`rounded-full p-2 text-gray-400 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-500 dark:text-gray-500 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 ${
                favored ? 'text-indigo-500' : ''
              }`}
              aria-label={favored ? 'Remove from favorites' : 'Add to favorites'}
              title={favored ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                size={18}
                className={`transition-transform duration-200 ${
                  justToggled ? 'scale-110' : 'scale-100'
                } ${favored ? 'fill-indigo-500' : ''}`}
                style={
                  favored
                    ? { filter: 'drop-shadow(0 0 3px rgba(99,102,241,0.5))' }
                    : undefined
                }
              />
            </button>
          )}

          {/* Edit */}
          <button
            onClick={onEdit}
            className={`rounded-full p-2 text-gray-400 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-500 dark:text-gray-500 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 ${
              showActions ? 'opacity-100' : 'opacity-0 lg:opacity-100'
            }`}
            aria-label="Edit page"
            title="Edit page"
          >
            <Edit2 size={18} />
          </button>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className={`rounded-full p-2 text-gray-400 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-500 dark:text-gray-500 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 ${
              showActions ? 'opacity-100' : 'opacity-0 lg:opacity-100'
            }`}
            aria-label="Copy page link"
            title="Copy page link"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className={`rounded-full p-2 text-gray-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${
              showActions ? 'opacity-100' : 'opacity-0 lg:opacity-100'
            }`}
            aria-label="Delete page"
            title="Delete page"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */

export default function PageViewer({ pageTitle, pageSlug }: PageViewerProps) {
  const params = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Resolve slug from props first, then URL params
  const resolvedSlug = pageSlug || params.slug || '';
  const resolvedTitle =
    pageTitle ||
    resolvedSlug
      .split('/')
      .pop()
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || '';

  const [pageData, setPageData] = useState<PageData>({
    content: '',
    frontmatter: null,
    loading: true,
    error: null,
    notFound: false,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchContent = useCallback(async () => {
    if (!resolvedSlug) return;

    setPageData({
      content: '',
      frontmatter: null,
      loading: true,
      error: null,
      notFound: false,
    });

    try {
      const content = await readPage(resolvedSlug);
      const { frontmatter, body } = extractFrontmatter(content);

      // Check for not-found pattern from mock API
      if (content.trim().startsWith('# Not Found')) {
        setPageData({
          content: '',
          frontmatter: null,
          loading: false,
          error: null,
          notFound: true,
        });
        return;
      }

      setPageData({
        content: body || content,
        frontmatter,
        loading: false,
        error: null,
        notFound: false,
      });
    } catch (err) {
      setPageData({
        content: '',
        frontmatter: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load page',
        notFound: false,
      });
    }
  }, [resolvedSlug]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Tags from frontmatter
  const tags =
    pageData.frontmatter?.tags && Array.isArray(pageData.frontmatter.tags)
      ? (pageData.frontmatter.tags as string[])
      : undefined;

  // Reading time (only when not loading)
  const readingTime = pageData.loading
    ? undefined
    : estimateReadingTime(pageData.content);

  // Last modified from frontmatter date
  const lastModified = pageData.frontmatter?.date as string | undefined;

  // --- Render states ---

  if (pageData.loading) {
    return (
      <div className="w-full space-y-6">
        {/* Title skeleton */}
        <div className="space-y-3">
          <Skeleton variant="text" className="h-8 w-3/4" />
          <Skeleton variant="text" className="h-4 w-1/2" />
        </div>
        {/* Tags skeleton */}
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-5 w-16 rounded-full" />
          <Skeleton variant="text" className="h-5 w-14 rounded-full" />
        </div>
        {/* Content skeletons */}
        <div className="space-y-3">
          <Skeleton variant="text" className="h-6 w-full" />
          <Skeleton variant="text" className="h-6 w-5/6" />
          <Skeleton variant="text" className="h-6 w-4/5" />
          <Skeleton variant="text" className="h-6 w-full" />
          <Skeleton variant="text" className="h-6 w-3/4" />
        </div>
      </div>
    );
  }

  if (pageData.notFound) {
    return <NotFoundState onGoBack={() => navigate('/pages')} />;
  }

  if (pageData.error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Failed to load page
        </h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {pageData.error}
        </p>
        <button
          onClick={fetchContent}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  // Empty content
  if (!pageData.content.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          This page is empty
        </h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          No content has been added to this page yet.
        </p>
        <button
          onClick={() => resolvedSlug && navigate(`/pages/${resolvedSlug}/edit`)}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Edit2 className="h-4 w-4" />
          Add content
        </button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={resolvedTitle}
        slug={resolvedSlug}
        lastModified={lastModified}
        readingTime={readingTime}
        tags={tags}
        onEdit={() => resolvedSlug && navigate(`/pages/${resolvedSlug}/edit`)}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <MarkdownRenderer content={pageData.content} className="w-full" />
      <BacklinksPanel pageSlug={resolvedSlug} />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete page"
        message={`Are you sure you want to delete "${resolvedTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          setShowDeleteDialog(false);
          navigate('/pages');
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
