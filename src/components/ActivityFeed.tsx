/** Recent activity feed showing curator job history. */

import { ReactNode } from 'react';
import StatusBadge, { Size as BadgeSize } from './StatusBadge';
import ExpandableRow from './ExpandableRow';

/** A single activity entry. */
export interface ActivityEntry {
  id: string;
  /** Asset / item name. */
  title: string;
  /** Status string (used by StatusBadge for colour mapping). */
  status: string;
  /** Relative time label (e.g. "2 min ago"). */
  timestamp: string;
  /** Duration label (e.g. "1m 32s"). */
  duration?: string;
  /** Icon shown on the left of the summary row. */
  icon?: ReactNode;
  /** Detail rows to show when the entry is expanded. */
  details?: ReactNode;
}

export interface ActivityFeedProps {
  /** List of activity entries. */
  entries: ActivityEntry[];
  /** Optional heading. Defaults to "Recent Activity". */
  title?: string;
}

/* ---------- Accent-border colour map ---------- */
const accentMap: Record<string, string> = {
  done: 'border-indigo-500',
  completed: 'border-indigo-500',
  processing: 'border-amber-500',
  queued: 'border-amber-500',
  failed: 'border-red-500',
  error: 'border-red-500',
};

/** Build the CSS class for the left accent border. */
function accentClass(status: string): string {
  const key = status.toLowerCase().trim();
  return accentMap[key] ?? 'border-gray-300 dark:border-gray-600';
}

/** Empty state rendered when there are no entries. */
function EmptyState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        No curator activity yet.{' '}
        <span className="font-medium text-gray-400 dark:text-gray-500">
          Enqueue an asset to get started.
        </span>
      </p>
    </div>
  );
}

/** Relative-time icon defaults (status → icon). */
const defaultIcons: Record<string, JSX.Element> = {
  done: (
    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  processing: (
    <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  failed: (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

/** Badge size for inline badges. */
const badgeSize: BadgeSize = 'sm';

export default function ActivityFeed({
  entries,
  title = 'Recent Activity',
}: ActivityFeedProps): JSX.Element {
  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/60">
        <div className="px-6 py-4 border-b border-gray-200/80 dark:border-gray-700/60">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/60">
      <div className="px-6 py-4 border-b border-gray-200/80 dark:border-gray-700/60">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      {/* Scroll container — virtualised feel via max-h */}
      <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/40">
        {entries.map((entry) => {
          const accent = accentClass(entry.status);
          const icon = entry.icon ?? defaultIcons[entry.status] ?? null;

          return (
            <ExpandableRow
              key={entry.id}
              summary={
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {icon}
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {entry.title}
                  </span>
                  <span className="flex-shrink-0">
                    <StatusBadge status={entry.status} size={badgeSize} />
                  </span>
                  {entry.duration && (
                    <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                      {entry.duration}
                    </span>
                  )}
                  <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                    {entry.timestamp}
                  </span>
                </div>
              }
            >
              <div className={`border-l-2 ${accent} pl-3`}>
                {entry.details ?? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No details available for this job.
                  </p>
                )}
              </div>
            </ExpandableRow>
          );
        })}
      </div>
    </div>
  );
}
