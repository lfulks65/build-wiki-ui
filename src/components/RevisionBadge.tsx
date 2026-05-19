/**
 * Small badge showing version number and last-saved time.
 *
 * Placed in page headers / metadata areas.  Hidden when there are
 * no revisions.  Click opens the version history panel.
 */

import { Clock } from "lucide-react";
import { useRelativeTime } from "@/hooks/useRelativeTime";

interface RevisionBadgeProps {
  /** Total number of revisions for this page */
  revisionCount: number;
  /** ISO timestamp of the most recent revision */
  lastSaved?: string;
  /** Click handler — usually opens the VersionHistory panel */
  onClick: () => void;
}

export function RevisionBadge({
  revisionCount,
  lastSaved,
  onClick,
}: RevisionBadgeProps) {
  // Don't render when there are no revisions
  if (revisionCount === 0) return null;

  const relativeTime = useRelativeTime(lastSaved);

  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-indigo-600 dark:hover:text-indigo-400"
      title={`Last saved ${relativeTime} · ${revisionCount} revision${revisionCount !== 1 ? "s" : ""}`}
      aria-label={`Version history: ${revisionCount} revision${revisionCount !== 1 ? "s" : ""}`}
    >
      <Clock size={12} />
      <span className="font-bold">v{revisionCount}</span>
    </button>
  );
}
