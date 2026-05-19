/**
 * Version History — slide-out panel showing revision timeline.
 *
 * Features:
 * - Timeline-style list of revisions (newest first)
 * - Each entry shows: relative timestamp, edit message, content preview
 * - "Compare with current" button → shows `<DiffViewer>` for that revision
 * - "Restore this version" button → triggers callback
 * - Current version highlighted
 * - Loading state while computing diffs
 * - Empty state for pages with no history
 * - Slide-in animation from the right
 * - Dark mode support
 */

import {
  useState,
  useCallback,
  useMemo,
  Fragment,
  useRef,
  useEffect,
} from "react";
import {
  X,
  Clock,
  RotateCcw,
  GitCompareArrows,
  FileText,
  History,
} from "lucide-react";
import type { PageRevision } from "@/hooks/useVersionHistory";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { DiffViewer } from "@/components/DiffViewer";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface VersionHistoryProps {
  /** Page slug this history is for */
  pageSlug: string;
  /** Current page content (to diff against) */
  currentContent: string;
  /** Revision array (newest first), from `useVersionHistory.getRevisions()` */
  revisions: PageRevision[];
  /** Whether there are any revisions */
  hasRevisions: boolean;
  /** Current revision timestamp (if available) */
  lastSaved?: string;
  /** Close panel callback */
  onClose: () => void;
  /** Called when user chooses to restore a revision */
  onRestore: (content: string, message: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** A single revision timeline entry */
function RevisionEntry({
  revision,
  isCurrent,
  onCompare,
  onRestore,
}: {
  revision: PageRevision;
  isCurrent: boolean;
  onCompare: () => void;
  onRestore: () => void;
}) {
  const relativeTime = useRelativeTime(revision.timestamp);
  const previewText =
    revision.content.length > 120
      ? revision.content.slice(0, 120).trimEnd() + "…"
      : revision.content.trim();

  return (
    <div
      className={`group relative border-l-2 pl-4 pt-3 pb-2 transition-colors ${
        isCurrent
          ? "border-indigo-400 dark:border-indigo-500"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
      }`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full ${
          isCurrent
            ? "bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/30"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Clock size={13} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{relativeTime}</span>
          {isCurrent && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              Current
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          {!isCurrent && (
            <>
              <button
                onClick={onCompare}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                title="Compare with current version"
              >
                <GitCompareArrows size={13} />
                Compare
              </button>
              <button
                onClick={onRestore}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                title="Restore this version"
              >
                <RotateCcw size={13} />
                Restore
              </button>
            </>
          )}
        </div>
      </div>

      {/* Message */}
      {revision.message && (
        <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
          {revision.message}
        </p>
      )}

      {/* Preview */}
      <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
        {previewText || <span className="italic">Empty page</span>}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main panel                                                         */
/* ------------------------------------------------------------------ */

export function VersionHistory({
  pageSlug,
  currentContent,
  revisions,
  hasRevisions,
  lastSaved,
  onClose,
  onRestore,
}: VersionHistoryProps) {
  const [viewingDiff, setViewingDiff] = useState<string | null>(null); // revision id being compared
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleRestore = useCallback(
    (id: string) => {
      const rev = revisions.find((r) => r.id === id);
      if (!rev) return;
      if (confirmRestore === id) {
        // Confirmed
        onRestore(rev.content, rev.message || "Restored from revision history");
        setConfirmRestore(null);
        setRestoringId(null);
        onClose();
      } else {
        setConfirmRestore(id);
      }
    },
    [revisions, confirmRestore, onRestore, onClose],
  );

  const handleCompare = useCallback((id: string) => {
    setViewingDiff(id);
  }, []);

  // Content of the revision being diffed
  const diffRevision = viewingDiff
    ? revisions.find((r) => r.id === viewingDiff)
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 md:max-w-xl"
        role="dialog"
        aria-label="Version History"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <History size={18} className="text-gray-400 dark:text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Version History
            </h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {revisions.length} revision{revisions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!hasRevisions ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                <FileText size={32} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                No version history yet
              </h3>
              <p className="mt-1 max-w-xs text-xs text-gray-400 dark:text-gray-500">
                Revisions are automatically saved when you save this page.
                Open the editor to create your first revision.
              </p>
            </div>
          ) : (
            /* Timeline */
            <div className="px-5 py-4">
              {viewingDiff && diffRevision ? (
                /* Diff view */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Comparing revision vs. current
                    </h3>
                    <button
                      onClick={() => setViewingDiff(null)}
                      className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      ← Back to timeline
                    </button>
                  </div>
                  <DiffViewer
                    oldContent={diffRevision.content}
                    newContent={currentContent}
                    oldLabel={`Revision (${useRelativeTime(diffRevision.timestamp)})`}
                    newLabel="Current"
                    unified
                  />
                </div>
              ) : (
                /* Timeline list */
                <div className="space-y-0">
                  {revisions.map((rev) => (
                    <RevisionEntry
                      key={rev.id}
                      revision={rev}
                      isCurrent={false}
                      onCompare={() => handleCompare(rev.id)}
                      onRestore={() => {
                        if (confirmRestore === rev.id) {
                          handleRestore(rev.id);
                        } else {
                          setConfirmRestore(rev.id);
                        }
                      }}
                    />
                  ))}
                  {/* Current version */}
                  {lastSaved && (
                    <RevisionEntry
                      key="current"
                      revision={{
                        id: "current",
                        pageSlug,
                        content: currentContent,
                        timestamp: lastSaved,
                        message: "Current version",
                      }}
                      isCurrent
                      onCompare={() => {}}
                      onRestore={() => {}}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasRevisions && (
          <div className="border-t border-gray-200 px-5 py-3 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
            Click a revision to compare · Click Restore twice to confirm
          </div>
        )}
      </div>
    </>
  );
}
