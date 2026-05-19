/**
 * src/components/RevisionBadge.tsx
 *
 * Small inline badge showing the version count for a page.
 * Renders a "v{N}" pill with a tooltip on hover.
 * Hidden entirely when revisionCount is 0.
 */

import { useState, useCallback } from 'react';
import { useRelativeTime } from '@/hooks/useRelativeTime';
import type { PageRevision } from '@/hooks/useVersionHistory';

/* ── Props ─────────────────────────────────────────────────────────────── */

interface RevisionBadgeProps {
  /** Total number of revisions for the page. */
  revisionCount: number;
  /** Timestamp of the most recent revision (ISO-8601 string). */
  lastSavedAt?: string;
  /** Called when the badge is clicked (e.g. to open the history panel). */
  onClick?: () => void;
}

/* ── Component ─────────────────────────────────────────────────────────── */

/**
 * A small pill badge showing the revision count (e.g. "v3").
 * Returns null when revisionCount is 0.
 */
export function RevisionBadge({
  revisionCount,
  lastSavedAt,
  onClick,
}: RevisionBadgeProps): React.ReactElement | null {
  const [hovered, setHovered] = useState(false);

  if (revisionCount === 0) {
    return null;
  }

  const relativeTime = useRelativeTime(lastSavedAt);
  const titleText = hovered || lastSavedAt
    ? `Last saved ${relativeTime} · ${revisionCount} revision${revisionCount !== 1 ? 's' : ''}`
    : `${revisionCount} revision${revisionCount !== 1 ? 's' : ''}`;

  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2 py-0.5
        text-xs font-medium
        bg-gray-200 text-gray-700
        dark:bg-gray-800 dark:text-gray-300
        transition-colors
        ${onClick ? 'cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700' : ''}
      `}
      title={titleText}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      aria-label={`${revisionCount} revision${revisionCount !== 1 ? 's' : ''}`}
    >
      v{revisionCount}
    </span>
  );
}

/* ── Unused export kept for compatibility ───────────────────────────────── */
// This file re-exports nothing from versionHistory; it only consumes types.
// The PageRevision type is imported above.
