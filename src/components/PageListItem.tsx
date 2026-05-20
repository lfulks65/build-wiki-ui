import { useState, useRef, useEffect } from 'react';
import {
  FileText, Edit2, Trash2, ExternalLink, Copy,
  MoreVertical, ChevronDown, ChevronUp
} from 'lucide-react';
import { useRelativeTime } from '../hooks/useRelativeTime';
import { FavoriteButton } from './FavoriteButton';
import { TagBadge } from './TagBadge';

interface PageListItemProps {
  title: string;
  path: string;
  slug?: string;
  modified: string | Date;
  snippet?: string;
  tags?: string[];
  onClick?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onCopyLink?: () => void;
  onDelete?: () => void;
}

/**
 * Individual page row/card in the PageList.
 * Shows title, path, tags, preview snippet, relative time,
 * and an action menu (Edit, Delete, Copy Link).
 */
export function PageListItem({
  title,
  path,
  slug,
  modified,
  snippet,
  tags,
  onClick,
  onView,
  onEdit,
  onCopyLink,
  onDelete,
}: PageListItemProps) {
  const relativeTime = useRelativeTime(modified);
  const [showActions, setShowActions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleCopyLink = () => {
    if (!slug) return;
    const link = `${window.location.origin}/pages/${slug}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    }).catch(() => {});
  };

  return (
    <div
      className={`group relative flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-700 dark:hover:bg-gray-800 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {/* File icon */}
      <div className="mt-0.5 flex-shrink-0">
        <FileText
          className="h-5 w-5 text-gray-400 transition-colors group-hover:text-indigo-500 dark:text-gray-500 dark:group-hover:text-indigo-400"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-indigo-700 dark:text-gray-100 dark:group-hover:text-indigo-300">
          {title}
        </h3>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {path}
        </p>

        {/* Tags inline */}
        {tags && tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} label={tag} removable={false} />
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Preview snippet from first paragraph */}
        {snippet && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {snippet}
          </p>
        )}

        {/* Relative time */}
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {relativeTime}
        </p>
      </div>

      {/* Left-side action buttons — visible on hover */}
      <div
        className={`flex items-center gap-0.5 transition-opacity duration-150 ${
          showActions ? 'opacity-100' : 'opacity-0 lg:opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Favorite button — only if slug is provided */}
        {slug && (
          <FavoriteButton pageSlug={slug} pageTitle={title} size="sm" />
        )}
        {/* View button */}
        {onView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="rounded-md p-1.5 text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
            aria-label={`View ${title}`}
            title="View page"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        )}
        {/* Edit button */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-md p-1.5 text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
            aria-label={`Edit ${title}`}
            title="Edit page"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Right-side action menu (...) */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((s) => !s);
          }}
          className={`rounded-md p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 ${
            showActions ? 'opacity-100' : 'opacity-0 lg:opacity-100'
          }`}
          aria-label="More actions"
          title="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {onView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View page
                </button>
              )}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit page
                </button>
              )}
              {(onCopyLink || onCopyLink !== undefined) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy link
                    </>
                  )}
                </button>
              )}
              {onDelete && (
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete page
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Inline check icon for the "Copied" state */
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
