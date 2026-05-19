import type { LucideIcon } from 'lucide-react';
import {
  Inbox,
  FileText,
  FolderOpen,
  SearchX,
  FileEdit,
  Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  EmptyState — reusable empty-state illustration                     */
/* ------------------------------------------------------------------ */

export interface EmptyStateProps {
  /** Icon to display (defaults to Inbox). */
  icon?: LucideIcon;
  /** Heading shown below the icon. */
  title: string;
  /** Supporting / description text. */
  description?: string;
  /** Primary call-to-action button. */
  action?: { label: string; onClick: () => void };
  /** Secondary action — rendered as an outlined / text link. */
  secondaryAction?: { label: string; onClick: () => void };
  /** Additional CSS classes for the root container. */
  className?: string;
}

/** Pre-defined icons mapped to names for convenience. */
export const EmptyStateIcons = {
  Inbox,
  FileText,
  FolderOpen,
  SearchX,
  FileEdit,
  Zap,
} as const;

export function EmptyState({
  icon: IconProp = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const rootClass = className
    ? `flex flex-col items-center justify-center py-12 text-center min-h-[28rem] w-full ${className}`
    : 'flex flex-col items-center justify-center py-12 text-center min-h-[28rem] w-full';

  return (
    <div className={rootClass}>
      {/* Icon with floating animation */}
      <div className="relative mb-4">
        {/* Background circle */}
        <div className="absolute inset-0 -m-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 blur-[2px] sm:-m-3" />
        {/* Icon container */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
          <IconProp className="h-10 w-10 text-indigo-500 animate-icon-float" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3">
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {action.label}
          </button>
        )}

        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
