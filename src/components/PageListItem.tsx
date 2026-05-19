import { FileText, Edit2 } from 'lucide-react';
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
  onEdit?: () => void;
}

/**
 * Individual page row/card in the PageList.
 */
export function PageListItem({
  title,
  path,
  slug,
  modified,
  snippet,
  tags,
  onClick,
  onEdit,
}: PageListItemProps) {
  const relativeTime = useRelativeTime(modified);

  return (
    <div
      className={`group relative flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-700 dark:hover:bg-gray-800 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
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
        {snippet && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {snippet}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {relativeTime}
        </p>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {/* Favorite button — only if slug is provided */}
        {slug && (
          <FavoriteButton pageSlug={slug} pageTitle={title} size="sm" />
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
    </div>
  );
}
