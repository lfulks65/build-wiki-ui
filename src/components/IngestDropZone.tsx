/**
 * IngestDropZone — drag-and-drop file ingest area for the AssetBrowser.
 *
 * Supports:
 *  - Drag & drop (with visual feedback on hover)
 *  - Clipboard paste (Ctrl+V for images/screenshots)
 *  - Per-file progress bars
 *  - Completion confirmation
 */

import { ReactNode, useCallback, useRef, useState, useEffect } from "react";

interface IngestDropZoneProps {
  /** Called for each file dropped or pasted. Returns an identifier for tracking. */
  onFiles: (files: File[]) => void;
  /** Per-file progress info. */
  ingestProgress?: { fileId: string; filename: string; status: string; progress: number }[];
  /** Confirmation message after all files complete. */
  onClear?: () => void;
}

/* -------------------------------------------------------------------------- */
/* Progress bar                                                               */
/* -------------------------------------------------------------------------- */

function ProgressBar({
  file,
  allComplete,
}: {
  file: { fileId: string; filename: string; status: string; progress: number };
  allComplete: boolean;
}) {
  const statusColor =
    file.status === "complete"
      ? "bg-emerald-500"
      : file.status === "failed"
      ? "bg-red-500"
      : file.status === "processing"
      ? "bg-amber-500"
      : "bg-blue-500";

  const statusLabel =
    file.status === "complete"
      ? "Complete"
      : file.status === "failed"
      ? "Failed"
      : file.status === "processing"
      ? "Processing"
      : file.status === "uploading"
      ? "Uploading"
      : "Pending";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        allComplete ? "bg-gray-50 dark:bg-gray-800" : "bg-blue-50/60 dark:bg-blue-900/20"
      }`}
    >
      <span className="flex-1 min-w-0 truncate font-medium text-gray-900 dark:text-gray-100">
        {file.filename}
      </span>
      <div className="flex-shrink-0 h-2 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${statusColor}`}
          style={{ width: `${Math.min(100, file.progress)}%` }}
        />
      </div>
      <span className="flex-shrink-0 w-12 text-right tabular-nums text-gray-500 dark:text-gray-400">
        {file.status === "complete" || file.status === "failed"
          ? statusLabel
          : `${Math.round(file.progress)}%`}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function IngestDropZone({
  onFiles,
  ingestProgress,
  onClear,
}: IngestDropZoneProps): JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false);
  const pasteRef = useRef<boolean>(false);

  // -----------------------------------------------------------------------
  // File handling
  // -----------------------------------------------------------------------

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;
      onFiles(fileArray);
    },
    [onFiles]
  );

  // -----------------------------------------------------------------------
  // Drag-and-drop handlers
  // -----------------------------------------------------------------------

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset when leaving the zone itself, not children
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  // -----------------------------------------------------------------------
  // Paste handler
  // -----------------------------------------------------------------------

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!pasteRef.current) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        processFiles(files);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [processFiles]);

  // -----------------------------------------------------------------------
  // Check if all files are complete
  // -----------------------------------------------------------------------

  const allComplete =
    ingestProgress && ingestProgress.length > 0
      ? ingestProgress.every((p) => p.status === "complete" || p.status === "failed")
      : false;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (allComplete && ingestProgress && ingestProgress.length > 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-900/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {ingestProgress.length} file{ingestProgress.length !== 1 ? "s" : ""} ingested
            </p>
            <p className="text-xs text-emerald-500 dark:text-emerald-400">
              Ready to organize?
            </p>
          </div>
          {onClear && (
            <button
              onClick={onClear}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Organize All
            </button>
          )}
        </div>
        <div className="mt-2 space-y-1">
          {ingestProgress.map((file) => (
            <ProgressBar key={file.fileId} file={file} allComplete={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => {
        // Trigger a file picker via hidden input
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = "image/*,application/pdf,audio/*,video/*,text/markdown,*/*";
        input.onchange = () => {
          if (input.files) processFiles(input.files);
        };
        input.click();
      }}
      className={`
        relative cursor-pointer rounded-xl border-2 border-dashed px-4 py-4 text-center
        transition-all duration-200
        ${
          isDragOver
            ? "border-blue-400 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-900/30 shadow-lg shadow-blue-500/10"
            : "border-gray-300 dark:border-gray-600 bg-gray-50/60 dark:bg-gray-800/40 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100/60 dark:hover:bg-gray-800/60"
        }
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*,application/pdf,audio/*,video/*,text/markdown,*/*";
          input.onchange = () => {
            if (input.files) processFiles(input.files);
          };
          input.click();
        }
      }}
    >
      {/* Glow effect when dragging */}
      {isDragOver && (
        <div className="absolute inset-0 rounded-xl bg-blue-400/10 dark:bg-blue-500/10 pointer-events-none animate-pulse" />
      )}

      <div className="relative z-10">
        {isDragOver ? (
          <>
            {/* Animated drop icon */}
            <svg
              className="mx-auto mb-2 w-10 h-10 text-blue-500 dark:text-blue-400 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <p className="text-base font-semibold text-blue-700 dark:text-blue-300">
              Drop files here to ingest
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">
              Images, PDFs, audio, video, markdown
            </p>
          </>
        ) : (
          <>
            <svg
              className="mx-auto mb-2 w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Drag &amp; drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Paste images with Ctrl+V
            </p>
          </>
        )}
      </div>

      {/* Progress bars */}
      {ingestProgress && ingestProgress.length > 0 && (
        <div className="relative z-10 mt-3 space-y-1 max-h-40 overflow-y-auto">
          {ingestProgress.map((file) => (
            <ProgressBar key={file.fileId} file={file} allComplete={false} />
          ))}
        </div>
      )}
    </div>
  );
}
