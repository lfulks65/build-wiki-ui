/**
 * src/components/DiffViewer.tsx
 *
 * Unified and side-by-side diff display component.
 * Uses computeDiff from utils/diff.ts for line-level diffing.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { computeDiff, DiffLine, DiffResult } from '@/utils/diff';

/* ── Types ─────────────────────────────────────────────────────────────── */

type DiffViewMode = 'unified' | 'side-by-side';

interface DiffViewerProps {
  /** Original text (will be compared against newText). */
  oldText: string;
  /** Modified text (compared against oldText). */
  newText: string;
  /** Optional label for the select toggle between modes. */
  modeLabel?: string;
  /** Optional class names for the root container. */
  className?: string;
}

/* ── Line rendering ────────────────────────────────────────────────────── */

interface LineProps {
  diffLine: DiffLine;
  showLineNumbers?: boolean;
}

function DiffLineRow({ diffLine, showLineNumbers = true }: LineProps): React.ReactElement {
  const { type, content, lineNumber } = diffLine;

  let rowClass = 'text-sm font-mono leading-6';
  let prefix = '';
  let bgClass = '';

  if (type === 'added') {
    rowClass += ' bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    prefix = '+';
  } else if (type === 'removed') {
    rowClass += ' bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    prefix = '-';
  } else {
    rowClass += ' bg-transparent text-gray-700 dark:text-gray-300';
    prefix = ' ';
  }

  return (
    <div className={`${rowClass} px-2 flex`}>
      {showLineNumbers && (
        <span className="w-12 text-right mr-3 select-none text-gray-400 dark:text-gray-500 flex-shrink-0 text-xs">
          {type === 'unchanged'
            ? lineNumber.old !== null ? String(lineNumber.old) : ''
            : type === 'added'
              ? String(lineNumber.new ?? '')
              : String(lineNumber.old ?? '')}
        </span>
      )}
      <span className="text-gray-400 dark:text-gray-500 select-none w-4 flex-shrink-0">{prefix}</span>
      <span className="flex-1 whitespace-pre overflow-hidden">{content || '\u00A0'}</span>
    </div>
  );
}

/* ── Summary bar ───────────────────────────────────────────────────────── */

interface SummaryBarProps {
  addedCount: number;
  removedCount: number;
}

function SummaryBar({ addedCount, removedCount }: SummaryBarProps): React.ReactElement {
  return (
    <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-sm">
      {addedCount > 0 && (
        <span className="text-green-600 dark:text-green-400 font-medium">
          +{addedCount} line{addedCount !== 1 ? 's' : ''}
        </span>
      )}
      {removedCount > 0 && (
        <span className="text-red-600 dark:text-red-400 font-medium">
          -{removedCount} line{removedCount !== 1 ? 's' : ''}
        </span>
      )}
      {addedCount === 0 && removedCount === 0 && (
        <span className="text-gray-400 dark:text-gray-500">No changes</span>
      )}
    </div>
  );
}

/* ── Side-by-side columns ──────────────────────────────────────────────── */

interface SideBySideProps {
  diffResult: DiffResult;
}

function SideBySideView({ diffResult }: SideBySideProps): React.ReactElement {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  // Sync scroll between the two columns
  const handleScroll = useCallback((source: 'left' | 'right') => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      const sourceEl = source === 'left' ? leftRef.current : rightRef.current;
      const targetEl = source === 'left' ? rightRef.current : leftRef.current;
      if (sourceEl && targetEl) {
        targetEl.scrollTop = sourceEl.scrollTop;
        targetEl.scrollLeft = sourceEl.scrollLeft;
      }
    } finally {
      syncing.current = false;
    }
  }, []);

  return (
    <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
      {/* Left column — original text */}
      <div
        ref={leftRef}
        className="flex-1 overflow-auto max-h-[60vh] min-w-0"
        onScroll={() => handleScroll('left')}
        aria-label="Original text"
      >
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {diffResult.lines.map((line, idx) => {
            if (line.type === 'added') {
              return <div key={idx} className="h-6 bg-gray-50 dark:bg-gray-900/50" />;
            }
            return (
              <DiffLineRow key={idx} diffLine={line} />
            );
          })}
        </div>
      </div>

      {/* Right column — modified text */}
      <div
        ref={rightRef}
        className="flex-1 overflow-auto max-h-[60vh] min-w-0"
        onScroll={() => handleScroll('right')}
        aria-label="Modified text"
      >
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {diffResult.lines.map((line, idx) => {
            if (line.type === 'removed') {
              return <div key={idx} className="h-6 bg-gray-50 dark:bg-gray-900/50" />;
            }
            return (
              <DiffLineRow key={idx} diffLine={line} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────────────────── */

interface EmptyStateProps {
  message?: string;
}

function EmptyState({ message = 'Identical content — no differences to display' }: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500 text-sm">
      {message}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────── */

/**
 * Displays a diff between two texts in unified or side-by-side mode.
 *
 * @param oldText — the original text
 * @param newText — the modified text
 * @param modeLabel — optional label text for the view-mode toggle
 * @param className — optional additional class names
 */
export function DiffViewer({
  oldText,
  newText,
  modeLabel = 'View',
  className = '',
}: DiffViewerProps): React.ReactElement {
  const [mode, setMode] = useState<DiffViewMode>('unified');

  const diffResult = useMemo<DiffResult>(() => {
    if (oldText === '' && newText === '') {
      return { lines: [], addedCount: 0, removedCount: 0 };
    }
    return computeDiff(oldText, newText);
  }, [oldText, newText]);

  const hasChanges = diffResult.addedCount > 0 || diffResult.removedCount > 0;

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Summary bar */}
      <SummaryBar
        addedCount={diffResult.addedCount}
        removedCount={diffResult.removedCount}
      />

      {/* Mode toggle */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">{modeLabel}</span>
        <div className="flex items-center gap-1">
          <label
            htmlFor="diff-view-mode"
            className="text-xs text-gray-500 dark:text-gray-400 mr-1"
          >
            Mode:
          </label>
          <select
            id="diff-view-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as DiffViewMode)}
            className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Diff view mode"
          >
            <option value="unified">Unified</option>
            <option value="side-by-side">Side-by-side</option>
          </select>
        </div>
      </div>

      {/* Diff content */}
      <div className="bg-white dark:bg-gray-950">
        {!hasChanges ? (
          <EmptyState />
        ) : mode === 'unified' ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {diffResult.lines.map((line, idx) => (
              <DiffLineRow key={idx} diffLine={line} />
            ))}
          </div>
        ) : (
          <SideBySideView diffResult={diffResult} />
        )}
      </div>
    </div>
  );
}
