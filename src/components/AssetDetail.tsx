/**
 * AssetDetail — slide-in panel showing asset detail with tabs.
 *
 * Tabs: Overview | Chunks | Metadata | Processing Log
 *
 * Features:
 *  - Full asset info (mime type, size, dimensions, duration, etc.)
 *  - Paginated text chunks
 *  - Raw YAML-style metadata view
 *  - Timeline of processing events
 *  - Action buttons: Organize, Re-process, Delete, Copy ID
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  X,
  Copy,
  FolderOpen,
  RotateCcw,
  Trash2,
  FileText,
  ImageIcon,
  Music,
  Video,
  FileCode,
  File,
  Clock,
  Hash,
  Calendar,
  ExternalLink,
  FileType2,
  Cpu,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { getAssetChunks, getProcessingLog, deleteAsset, organizeAsset, reprocessAsset } from "@/lib/api";
import type { AssetRecord, AssetType, AssetChunk, ProcessingEvent } from "@/types/wiki";

/* -------------------------------------------------------------------------- */
/* Type icon helpers                                                          */
/* -------------------------------------------------------------------------- */

function typeIcon(type: AssetType, size = "md"): JSX.Element {
  const cls = size === "lg" ? "w-16 h-16" : size === "sm" ? "w-4 h-4" : "w-8 h-8";
  switch (type) {
    case "image": return <ImageIcon className={`${cls} text-blue-500`} />;
    case "pdf": return <FileText className={`${cls} text-red-500`} />;
    case "audio": return <Music className={`${cls} text-purple-500`} />;
    case "video": return <Video className={`${cls} text-pink-500`} />;
    case "markdown": return <FileCode className={`${cls} text-cyan-500`} />;
    default: return <File className={`${cls} text-gray-500`} />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Tab components                                                             */
/* -------------------------------------------------------------------------- */

function OverviewTab({ asset }: { asset: AssetRecord }): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Preview area */}
      <div className="rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
        {asset.type === "image" && (
          asset.thumbnail ? (
            <img src={asset.thumbnail} alt={asset.filename} className="max-h-48 rounded-lg" />
          ) : (
            typeIcon(asset.type, "lg")
          )
        )}
        {(asset.type !== "image") && (
          <div className="flex flex-col items-center gap-3">
            {typeIcon(asset.type, "lg")}
            <span className="text-xs text-gray-400 capitalize">{asset.type}</span>
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoItem label="MIME Type" value={asset.mimeType} icon={<FileType2 className="w-3.5 h-3.5" />} />
        <InfoItem label="File Size" value={formatFileSize(asset.fileSize)} icon={<Hash className="w-3.5 h-3.5" />} />
        {asset.width && asset.height && (
          <>
            <InfoItem label="Dimensions" value={`${asset.width} × ${asset.height}`} icon={<ImageIcon className="w-3.5 h-3.5" />} />
            <InfoItem label="Aspect Ratio" value={`${(asset.width / asset.height).toFixed(2)}`} />
          </>
        )}
        {asset.duration && (
          <InfoItem label="Duration" value={formatDuration(asset.duration)} icon={<Clock className="w-3.5 h-3.5" />} />
        )}
        <InfoItem label="Original Name" value={asset.originalFilename} />
        {asset.sourceUrl && (
          <InfoItem label="Source" value={asset.sourceUrl} icon={<ExternalLink className="w-3.5 h-3.5" />} />
        )}
        <InfoItem label="Ingested" value={new Date(asset.ingestDate).toLocaleString()} icon={<Calendar className="w-3.5 h-3.5" />} />
      </div>

      {/* Chunks count */}
      {asset.chunks.length > 0 && (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Text Chunks
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {asset.chunks.length} chunk{asset.chunks.length !== 1 ? "s" : ""} extracted during processing
          </p>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: JSX.Element }): JSX.Element {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon}
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chunks tab                                                                 */
/* -------------------------------------------------------------------------- */

function ChunksTab({ assetId }: { assetId: string }): JSX.Element {
  const [chunks, setChunks] = useState<AssetChunk[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAssetChunks(assetId, page, pageSize)
      .then((res) => {
        if (!cancelled) {
          setChunks(res.chunks);
          setTotal(res.total);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assetId, page]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 h-20" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">Failed to load chunks: {error}</p>
      </div>
    );
  }

  if (chunks.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No text chunks found for this asset.</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {total} chunk{total !== 1 ? "s" : ""} total · page {page} of {totalPages}
      </p>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {chunks.map((chunk) => (
          <div
            key={chunk.id}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
                #{chunk.index}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {chunk.text}
            </p>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Metadata tab                                                               */
/* -------------------------------------------------------------------------- */

function MetadataTab({ asset }: { asset: AssetRecord }): JSX.Element {
  const yaml = JSON.stringify(asset.metadata, null, 2);

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-900 dark:bg-gray-950 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800">
          <span className="text-xs font-mono text-gray-400">metadata.json</span>
        </div>
        <pre className="p-3 text-xs font-mono text-gray-300 dark:text-gray-400 max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
          {yaml}
        </pre>
      </div>

      {/* Full record YAML view */}
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 pt-2">Full Asset Record</p>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-900 dark:bg-gray-950 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800">
          <span className="text-xs font-mono text-gray-400">asset-record.json</span>
        </div>
        <pre className="p-3 text-xs font-mono text-gray-300 dark:text-gray-400 max-h-80 overflow-y-auto whitespace-pre-wrap break-words">
          {JSON.stringify(
            {
              id: asset.id,
              filename: asset.filename,
              type: asset.type,
              status: asset.status,
              mimeType: asset.mimeType,
              fileSize: asset.fileSize,
              width: asset.width,
              height: asset.height,
              duration: asset.duration,
              originalFilename: asset.originalFilename,
              ingestDate: asset.ingestDate,
              chunks: asset.chunks.map((c) => ({ index: c.index, text: c.text.slice(0, 100) + (c.text.length > 100 ? "…" : "") })),
              metadata: asset.metadata,
              processingLog: asset.processingLog.map((e) => ({
                stage: e.stage,
                status: e.status,
                timestamp: e.timestamp,
                details: e.details,
              })),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Processing Log tab                                                         */
/* -------------------------------------------------------------------------- */

function ProcessingLogTab({ assetId }: { assetId: string }): JSX.Element {
  const [events, setEvents] = useState<ProcessingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProcessingLog(assetId)
      .then((res) => {
        if (!cancelled) setEvents(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [assetId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 h-16" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">Failed to load processing log: {error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Cpu className="mx-auto w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No processing events yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => (
        <ProcessingEventItem key={event.id} event={event} isLast={i === events.length - 1} />
      ))}
    </div>
  );
}

function ProcessingEventItem({ event, isLast }: { event: ProcessingEvent; isLast: boolean }): JSX.Element {
  const dotColor =
    event.status === "completed"
      ? "bg-emerald-500"
      : event.status === "failed"
      ? "bg-red-500"
      : event.status === "in_progress"
      ? "bg-amber-500 animate-pulse"
      : "bg-gray-400";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor}`} />
        {!isLast && <div className="w-px h-full bg-gray-200 dark:bg-gray-700 my-1" />}
      </div>
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
            {event.stage}
          </span>
          <StatusBadge status={event.status} size="sm" />
        </div>
        {event.details && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.details}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 tabular-nums">
          {new Date(event.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main panel                                                                 */
/* -------------------------------------------------------------------------- */

type TabName = "overview" | "chunks" | "metadata" | "processing-log";

export interface AssetDetailProps {
  asset: AssetRecord;
  onClose: () => void;
  onOrganize: (id: string) => void;
  onReprocess: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AssetDetail({
  asset,
  onClose,
  onOrganize,
  onReprocess,
  onDelete,
}: AssetDetailProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabName>("overview");
  const [copied, setCopied] = useState(false);

  const tabs: { key: TabName; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "chunks", label: `Chunks${asset.chunks.length > 0 ? ` (${asset.chunks.length})` : ""}` },
    { key: "metadata", label: "Metadata" },
    { key: "processing-log", label: "Processing Log" },
  ];

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(asset.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [asset.id]);

  const handleDelete = useCallback(() => {
    if (confirm(`Delete "${asset.filename}"? This cannot be undone.`)) {
      onDelete(asset.id);
    }
  }, [asset, onDelete]);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Asset detail: ${asset.filename}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 dark:bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-50 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {typeIcon(asset.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={asset.filename}>
                {asset.filename}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{asset.type}</span>
                <StatusBadge status={asset.status} size="sm" />
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleCopyId}
                className={`p-1.5 rounded-lg transition-colors ${
                  copied
                    ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={copied ? "Copied!" : "Copy Asset ID"}
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-5">
          <div className="flex gap-0 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-3 py-2.5 text-xs font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "overview" && <OverviewTab asset={asset} />}
          {activeTab === "chunks" && <ChunksTab assetId={asset.id} />}
          {activeTab === "metadata" && <MetadataTab asset={asset} />}
          {activeTab === "processing-log" && <ProcessingLogTab assetId={asset.id} />}
        </div>

        {/* Actions footer */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-5 py-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOrganize(asset.id)}
              disabled={asset.status === "processing"}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Organize
            </button>
            <button
              onClick={() => onReprocess(asset.id)}
              disabled={asset.status === "processing"}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-process
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-300 dark:border-red-800 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
