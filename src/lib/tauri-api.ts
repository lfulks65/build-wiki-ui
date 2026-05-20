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

/** Full asset record with chunks, metadata, and processing log. */
export interface AssetRecord {
  id: string;
  filename: string;
  type: string;
  status: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  originalFilename: string;
  sourceUrl?: string;
  ingestDate: string;
  modified: string;
  chunks: AssetChunk[];
  metadata: Record<string, unknown>;
  processingLog: ProcessingEvent[];
}

/** A single text chunk extracted during asset processing. */
export interface AssetChunk {
  id: string;
  text: string;
  index: number;
}

/** An event in the asset processing pipeline. */
export interface ProcessingEvent {
  id: string;
  stage: string;
  status: string;
  timestamp: string;
  details?: string;
}

/** Progress info for a file being ingested. */
export interface IngestProgress {
  fileId: string;
  filename: string;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'failed';
  progress: number;
  error?: string;
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
// Asset detail / management commands
// ---------------------------------------------------------------------------

/**
 * Get the full asset record including chunks, metadata, and processing log.
 * @param assetId — The asset identifier.
 * @returns A full `AssetRecord`.
 */
export function getAssetDetail(assetId: string): Promise<AssetRecord> {
  return invoke("get_asset_detail", { assetId });
}

/**
 * Delete an asset from the vault.
 * @param assetId — The asset identifier to delete.
 */
export function deleteAsset(assetId: string): Promise<void> {
  return invoke("delete_asset", { assetId });
}

/**
 * Re-process an already ingested asset.
 * @param assetId — The asset identifier to re-process.
 */
export function reprocessAsset(assetId: string): Promise<void> {
  return invoke("reprocess_asset", { assetId });
}

/**
 * Enqueue an asset for the curator (organise).
 * @param assetId — The asset identifier to enqueue.
 */
export function organizeAsset(assetId: string): Promise<void> {
  return invoke("organize_asset", { assetId });
}

/**
 * Get text chunks for an asset, with pagination.
 * @param assetId — The asset identifier.
 * @param page — Page number (1-based).
 * @param pageSize — Number of chunks per page.
 */
export function getAssetChunks(
  assetId: string,
  page?: number,
  pageSize?: number
): Promise<{ chunks: AssetChunk[]; total: number; page: number }> {
  return invoke("get_asset_chunks", {
    assetId,
    page: page ?? 1,
    pageSize: pageSize ?? 20,
  });
}

/**
 * Get processing log events for an asset.
 * @param assetId — The asset identifier.
 * @returns Array of `ProcessingEvent`.
 */
export function getProcessingLog(assetId: string): Promise<ProcessingEvent[]> {
  return invoke("get_processing_log", { assetId });
}
