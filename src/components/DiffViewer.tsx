/**
 * Visual diff viewer — unified (default) or side-by-side mode.
 *
 * Accepts two text strings and renders colored lines showing added,
 * removed, and unchanged content with line numbers.
 *
 * Dark-mode compatible via Tailwind `dark:` variants.
 */

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { computeDiff, DiffLine, DiffResult } from "@/utils/diff";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DiffViewerProps {
  /** Content before the change */
  oldContent: string;
  /** Content after the change */
  newContent: string;
  /** Label for the old-content column */
  oldLabel?: string;
  /** Label for the new-content column */
  newLabel?: string;
  /** When true, show unified single-column view (default).  False → side-by-side. */
  unified?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** A single diff line row in unified mode */
function UnifiedLine({ line }: { line: DiffLine }) {
  const baseClasses =
    "whitespace-pre text-xs font-mono leading-5";

  const typeClasses: Record<string, string> = {
    added: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    removed: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    unchanged: "text-gray-700 dark:text-gray-300",
  };

  const prefix = line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

  return (
    <div className={`${baseClasses} ${typeClasses[line.type]} flex`}>
      <span className="select-none px-2 text-right text-gray-400 dark:text-gray-500 min-w-[2.5rem]">
        {line.lineNumber.old > 0 ? line.lineNumber.old : " "}
      </span>
      <span className="select-none px-1.5 text-gray-400 dark:text-gray-500">
        {prefix}
      </span>
      <span className="pr-4 flex-1 overflow-hidden text-ellipsis">
        {line.content || "\u00A0"}
      </span>
    </div>
  );
}

/** A row in side-by-side diff mode */
function SideBySideRow({ line, oldNum, newNum }: { line: DiffLine; oldNum: number; newNum: number }) {
  const baseClasses = "whitespace-pre text-xs font-mono leading-5 flex flex-1";

  const typeClasses: Record<string, string> = {
    added: "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300",
    removed: "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300",
    unchanged: "text-gray-700 dark:text-gray-300",
  };

  const prefix = line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

  return (
    <div className={`flex w-full ${baseClasses} ${typeClasses[line.type]}`}>
      <span className="select-none px-2 text-right text-gray-400 dark:text-gray-500 min-w-[2rem] text-xs">
        {oldNum > 0 ? oldNum : "\u00A0"}
      </span>
      <span className="select-none px-1.5 text-xs text-gray-400 dark:text-gray-500">
        {prefix}
      </span>
      <span className="pr-2 flex-1 overflow-hidden text-ellipsis">
        {line.content || "\u00A0"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function DiffViewer({
  oldContent,
  newContent,
  oldLabel = "Old",
  newLabel = "New",
  unified = true,
}: DiffViewerProps) {
  const result = useMemo<DiffResult>(
    () => computeDiff(oldContent, newContent),
    [oldContent, newContent],
  );

  const syncScrollRef = useRef<HTMLDivElement>(null);
  const [syncScroll, setSyncScroll] = useState(false);

  // Sync-scroll handler for side-by-side mode
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!syncScroll || !syncScrollRef.current) return;
      const target = e.currentTarget;
      syncScrollRef.current.scrollTop =
        (target.scrollTop / (target.scrollHeight - target.clientHeight)) *
        (syncScrollRef.current.scrollHeight - syncScrollRef.current.clientHeight);
    },
    [syncScroll],
  );

  const totalLines = result.lines.length;
  const showSummary =
    result.added > 0 || result.removed > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Summary bar */}
      {showSummary && (
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <div className="flex items-center gap-3">
            {result.added > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" />
                +{result.added} line{result.added !== 1 ? "s" : ""}
              </span>
            )}
            {result.removed > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" />
                –{result.removed} line{result.removed !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="text-gray-400">{totalLines} line{totalLines !== 1 ? "s" : ""} total</div>
        </div>
      )}

      {/* Labels */}
      {(oldLabel || newLabel) && (
        <div className="flex border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:border-gray-700 dark:text-gray-500">
          {oldLabel && <div className="flex-1 px-4 py-2">{oldLabel}</div>}
          {newLabel && <div className="flex-1 px-4 py-2">{newLabel}</div>}
        </div>
      )}

      {/* Diff content */}
      <div
        className="overflow-auto"
        style={{ maxHeight: "48rem" }}
      >
        {unified ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {result.lines.map((line, i) => (
              <UnifiedLine key={i} line={line} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
            {/* Old column */}
            <div
              className="overflow-auto"
              onScroll={handleScroll}
            >
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {result.lines.map((line, i) => {
                  const oldNum = line.lineNumber.old;
                  return (
                    <SideBySideRow
                      key={`old-${i}`}
                      line={line}
                      oldNum={oldNum}
                      newNum={0}
                    />
                  );
                })}
              </div>
            </div>
            {/* New column */}
            <div
              ref={syncScrollRef}
              className="overflow-auto"
            >
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {result.lines.map((line, i) => {
                  const newNum = line.lineNumber.new;
                  return (
                    <SideBySideRow
                      key={`new-${i}`}
                      line={line}
                      oldNum={0}
                      newNum={newNum}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
