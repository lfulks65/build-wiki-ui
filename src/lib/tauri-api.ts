/**
 * Tauri API bridge layer.
 *
 * Provides TypeScript types and a client that wraps `@tauri-apps/api/core`
 * `invoke` calls to communicate with the Rust backend commands.
 *
 * @module tauri-api
 */

// ---------------------------------------------------------------------------
// Types — mirror the Tauri command signatures defined in the Rust backend
// ---------------------------------------------------------------------------

/** Summary of a wiki page stored on disk. */
export interface PageSummary {
  /** Display title of the page. */
  title: string;
  /** File-system path relative to the vault root. */
  path: string;
  /** Last-modified timestamp (ISO-8601). */
  modified: string;
}

/** Summary of an asset associated with the wiki. */
export interface AssetSummary {
  /** Unique asset identifier. */
  id: string;
  /** Original file name (including extension). */
  filename: string;
  /** MIME-type category (`image`, `pdf`, `audio`, etc.). */
  type: string;
  /** Processing status (`queued`, `processing`, `complete`, `failed`). */
  status: string;
}

/** Information about the wiki vault. */
export interface VaultInfo {
  /** Absolute path to the vault directory. */
  path: string;
  /** Human-readable vault name. */
  name: string;
  /** Total number of pages in the vault. */
  pageCount: number;
  /** Total number of assets in the vault. */
  assetCount: number;
}

/** A single search result from a wiki page. */
export interface SearchResult {
  /** Page title. */
  title: string;
  /** Page path. */
  path: string;
  /** Short text snippet containing the search query term. */
  snippet: string;
  /** Result type (`page`, `asset`, etc.). */
  type: string;
}

/** Current status of the asset curator background job. */
export interface CuratorStatus {
  /** Whether the curator is currently running. */
  running: boolean;
  /** Whether the curator is idle (not running but able to accept jobs). */
  idle: boolean;
  /** ISO-8601 timestamp of the last completed run, or `null`. */
  lastRun: string | null;
  /** Number of items in the processing queue. */
  queueDepth: number;
}

// ---------------------------------------------------------------------------
// Curator Dashboard types
// ---------------------------------------------------------------------------

/** A single job in the worker queue (queued, running, done, failed). */
export interface QueueJob {
  /** Unique job identifier. */
  jobId: string;
  /** Kind of job (`ingest` or `import`). */
  kind: string;
  /** Subject identifier (asset ID or display name). */
  subject: string;
  /** Enqueued-at timestamp (ISO-8601). */
  enqueuedAt: string | null;
  /** Started-at timestamp (ISO-8601), or `null` if not started. */
  startedAt: string | null;
  /** Finished-at timestamp (ISO-8601), or `null` if not finished. */
  finishedAt: string | null;
  /** Last error message, if the job failed. */
  lastError: string | null;
  /** Number of retry attempts made. */
  attempts: number;
}

/** A job that is currently being processed by a worker instance. */
export interface RunningJob {
  /** The job record. */
  job: QueueJob;
  /** Worker instance ID processing this job. */
  instance: string;
}

/** Full snapshot of the job queue state. */
export interface OrganizeStatus {
  /** Jobs waiting in the queue. */
  queued: QueueJob[];
  /** Jobs currently being processed. */
  running: RunningJob[];
  /** Recently completed jobs (most recent first). */
  done: QueueJob[];
  /** Recently failed jobs (most recent first). */
  failed: QueueJob[];
  /** Worker process ID, or `null` if not running. */
  pid: number | null;
  /** Path to the worker log file. */
  logPath: string;
  /** Number of queued jobs (convenience alias). */
  queueDepth: number;
}

/** A single curator log entry from the JSONL log. */
export interface CuratorLogEntry {
  /** Unique run identifier. */
  runId: string;
  /** Loop name (e.g. `ingest`, `writeback`). */
  loopName: string;
  /** Asset ID, if applicable. */
  assetId: string | null;
  /** Model used for this run. */
  model: string | null;
  /** Start timestamp (Unix epoch seconds). */
  startedAt: number;
  /** Finish timestamp (Unix epoch seconds). */
  finishedAt: number;
  /** Number of edits applied. */
  editsApplied: number;
  /** Whether the batch cap was hit. */
  batchCapped: boolean;
  /** Model-generated rationale. */
  rationale: string;
  /** Token usage breakdown. */
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    cachedPromptTokens: number;
  };
}

/** Paginated response for curator log history. */
export interface CuratorLogResponse {
  /** Total number of log entries. */
  total: number;
  /** Entries for the current page (newest first). */
  entries: CuratorLogEntry[];
  /** Offset used for this page. */
  offset: number;
  /** Number of entries per page. */
  limit: number;
}

/** Outcome of an enqueue operation. */
export interface EnqueueResult {
  /** The job ID that was created or returned. */
  jobId: string;
  /** Whether this was a new enqueue or an existing pending job. */
  fresh: boolean;
}

// ---------------------------------------------------------------------------
// Client functions — each calls `invoke<T>()` against a Tauri command
// ---------------------------------------------------------------------------

import { invoke } from "@tauri-apps/api/core";

/**
 * Return metadata about the active wiki vault.
 * @returns A `VaultInfo` object.
 */
export function getVaultInfo(): Promise<VaultInfo> {
  return invoke("get_vault_info");
}

/**
 * List all wiki pages with summary metadata.
 * @returns An array of `PageSummary` objects.
 */
export function listPages(): Promise<PageSummary[]> {
  return invoke("list_pages");
}

/**
 * Read the full markdown content of a page.
 * @param path — Page path relative to the vault root.
 * @returns The raw markdown string.
 */
export function readPage(path: string): Promise<string> {
  return invoke("read_page", { path });
}

/**
 * Write (or overwrite) a wiki page.
 * @param path — Page path relative to the vault root.
 * @param content — Raw markdown content to write.
 */
export function writePage(path: string, content: string): Promise<void> {
  return invoke("write_page", { path, content });
}

/**
 * Search wiki pages by a query string.
 * @param query — Search terms (supports simple substring matching).
 * @returns Matching `SearchResult` objects.
 */
export function searchPages(query: string): Promise<SearchResult[]> {
  return invoke("search_pages", { query });
}

/**
 * List all wiki assets with summary metadata.
 * @returns An array of `AssetSummary` objects.
 */
export function listAssets(): Promise<AssetSummary[]> {
  return invoke("list_assets");
}

/**
 * Get the current status of the asset curator.
 * @returns A `CuratorStatus` object.
 */
export function getCuratorStatus(): Promise<CuratorStatus> {
  return invoke("get_curator_status");
}

/**
 * Enqueue an asset for curator processing.
 * @param assetId — The asset identifier to process.
 */
export function enqueueCurator(assetId: string): Promise<void> {
  return invoke("enqueue_curator", { assetId });
}

// ---------------------------------------------------------------------------
// Curator Dashboard commands
// ---------------------------------------------------------------------------

/**
 * Get full job queue status including worker PID, log path, and recent jobs.
 * @returns Full `OrganizeStatus` snapshot.
 */
export function organizeStatus(): Promise<OrganizeStatus> {
  return invoke("organize_status");
}

/**
 * Retrieve curator log entries with pagination.
 * @param limit — Number of entries to return (default 20).
 * @param offset — Pagination offset (default 0).
 * @returns Paginated `CuratorLogResponse`.
 */
export function curatorLog(
  limit: number = 20,
  offset: number = 0
): Promise<CuratorLogResponse> {
  return invoke("curator_log", { limit, offset });
}

/**
 * Start (or resume) the curator worker.
 * Spawns a detached worker process if one is not already running.
 * @returns The PID of the (new or existing) worker process.
 */
export function workerStart(): Promise<number> {
  return invoke("worker_start");
}

/**
 * Stop the running curator worker by sending it a termination signal.
 * @returns `true` if the worker was stopped, `false` if it wasn't running.
 */
export function workerStop(): Promise<boolean> {
  return invoke("worker_stop");
}

/**
 * Enqueue a single asset for processing.
 * @param assetId — The asset identifier to enqueue.
 * @returns The enqueue result (job ID and whether it was fresh).
 */
export function organizeEnqueue(assetId: string): Promise<EnqueueResult> {
  return invoke("organize_enqueue", { assetId });
}

/**
 * Enqueue all pending (unorganized) assets at once.
 * @returns Number of jobs enqueued.
 */
export function organizeEnqueueAll(): Promise<number> {
  return invoke("organize_enqueue_all");
}

/**
 * Enqueue a raw file from the inbox for import (simulates file picker).
 * @param filePath — Path to the file to ingest.
 * @returns The job ID of the import job.
 */
export function organizeIngestFile(filePath: string): Promise<string> {
  return invoke("organize_ingest_file", { filePath });
}
