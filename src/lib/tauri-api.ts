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

/** A registered vault entry in the vault registry. */
export interface VaultRegistryEntry {
  /** Unique registry ID. */
  id: string;
  /** Human-readable vault name. */
  name: string;
  /** Absolute path to the vault directory. */
  path: string;
  /** Git branch (or `null` if not a git repo). */
  branch: string | null;
  /** Total number of pages. */
  pageCount: number;
  /** Total number of assets. */
  assetCount: number;
  /** Whether this vault is the default. */
  isDefault: boolean;
  /** Last modified timestamp (ISO-8601). */
  lastModified: string | null;
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

/** Health status of a vault. */
export interface VaultHealth {
  /** Whether the vault path exists on disk. */
  pathExists: boolean;
  /** Whether the vault is a valid git repository. */
  gitRepoValid: boolean;
  /** Whether the search index is up-to-date. */
  indexUpToDate: boolean;
  /** Error message if any check failed, or `null`. */
  error: string | null;
}

/** Worker status information. */
export interface WorkerStatus {
  /** Whether the worker is currently running. */
  running: boolean;
  /** Process ID, or `null` if not running. */
  pid: number | null;
  /** Uptime in seconds, or `null` if not running. */
  uptime: number | null;
  /** Path to the worker log file. */
  logPath: string | null;
  /** Current state of the worker. */
  state: "running" | "idle" | "stopped";
}

/** Disk usage summary. */
export interface DiskUsage {
  /** Total size of vault directories in bytes. */
  vaultSize: number;
  /** Total size of the blob store in bytes. */
  blobSize: number;
}

/** Recent error entry from the curator log. */
export interface LogError {
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Error level (error, warn, etc.). */
  level: string;
  /** Error message. */
  message: string;
}

/** Organize status — result of the `organizeStatus` command. */
export interface OrganizeStatus {
  /** Total files found. */
  totalFiles: number;
  /** Files already organized. */
  organizedCount: number;
  /** Orphaned files not in any vault. */
  orphanedCount: number;
  /** Pending moves. */
  pendingMoves: number;
}

/** An API key configuration entry. */
export interface ApiKeyEntry {
  /** The key name / identifier (e.g. `OPENROUTER_API_KEY`). */
  key: string;
  /** Whether the key has a value set. */
  hasValue: boolean;
  /** Whether the key is required. */
  required: boolean;
}

/** System status — aggregated health data. */
export interface SystemStatus {
  /** Vault health for each registered vault. */
  vaults: VaultHealth[];
  /** Worker status. */
  worker: WorkerStatus;
  /** Disk usage. */
  disk: DiskUsage;
  /** Recent errors from the log. */
  recentErrors: LogError[];
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
// Vault Management
// ---------------------------------------------------------------------------

/**
 * List all registered vaults from the vault registry.
 * @returns An array of `VaultRegistryEntry` objects.
 */
export function listVaults(): Promise<VaultRegistryEntry[]> {
  return invoke("list_vaults");
}

/**
 * Register a new vault in the registry.
 * @param name — Human-readable vault name.
 * @param path — Absolute path to the vault directory.
 */
export function initVault(name: string, path: string): Promise<VaultRegistryEntry> {
  return invoke("init_vault", { name, path });
}

/**
 * Clone an existing vault from a git repository.
 * @param url — Git URL to clone from.
 * @param localPath — Local path where the vault will be cloned.
 */
export function cloneVault(url: string, localPath: string): Promise<VaultRegistryEntry> {
  return invoke("clone_vault", { url, localPath });
}

/**
 * Set a vault as the default (active) vault.
 * @param vaultId — The registry ID of the vault to set as default.
 */
export function setDefaultVault(vaultId: string): Promise<void> {
  return invoke("set_default_vault", { vaultId });
}

/**
 * Remove a vault from the registry (does not delete files on disk).
 * @param vaultId — The registry ID of the vault to remove.
 */
export function removeVault(vaultId: string): Promise<void> {
  return invoke("remove_vault", { vaultId });
}

/**
 * Open a vault in the current session (set as active).
 * @param vaultId — The registry ID of the vault to open.
 */
export function openVault(vaultId: string): Promise<void> {
  return invoke("open_vault", { vaultId });
}

/**
 * Get the health status of a vault.
 * @param vaultId — The registry ID of the vault.
 * @returns A `VaultHealth` object.
 */
export function getVaultHealth(vaultId: string): Promise<VaultHealth> {
  return invoke("get_vault_health", { vaultId });
}

// ---------------------------------------------------------------------------
// API Key Management
// ---------------------------------------------------------------------------

/**
 * Get the list of known API key configuration entries.
 * @returns An array of `ApiKeyEntry` objects.
 */
export function listApiKeys(): Promise<ApiKeyEntry[]> {
  return invoke("list_api_keys");
}

/**
 * Get the current value of an API key (masked by default).
 * @param key — The key name.
 * @param full — If `true`, return the full value; if `false`, return masked.
 * @returns The key value (possibly masked).
 */
export function getApiKey(key: string, full?: boolean): Promise<string> {
  return invoke("get_api_key", { key, full: full ?? false });
}

/**
 * Set (or update) an API key value.
 * @param key — The key name (e.g. `OPENROUTER_API_KEY`).
 * @param value — The secret value.
 */
export function setApiKey(key: string, value: string): Promise<void> {
  return invoke("set_api_key", { key, value });
}

/**
 * Delete (unregister) an API key.
 * @param key — The key name to delete.
 */
export function deleteApiKey(key: string): Promise<void> {
  return invoke("delete_api_key", { key });
}

/**
 * Test the connection for a given API key type.
 * @param key — The key name to test.
 * @returns `true` if the connection succeeded.
 */
export function testApiKeyConnection(key: string): Promise<boolean> {
  return invoke("test_api_key_connection", { key });
}

// ---------------------------------------------------------------------------
// System Status
// ---------------------------------------------------------------------------

/**
 * Get the full system status dashboard data.
 * @returns A `SystemStatus` object.
 */
export function getSystemStatus(): Promise<SystemStatus> {
  return invoke("get_system_status");
}

/**
 * Rebuild the search index for a vault.
 * @param vaultId — The registry ID of the vault.
 */
export function indexRebuild(vaultId: string): Promise<void> {
  return invoke("index_rebuild", { vaultId });
}

/**
 * Run lint checks on a vault.
 * @param vaultId — The registry ID of the vault.
 * @returns An array of lint error strings.
 */
export function lintVault(vaultId: string): Promise<string[]> {
  return invoke("lint_vault", { vaultId });
}

/**
 * Get the organize / cleanup status.
 * @returns An `OrganizeStatus` object.
 */
export function organizeStatus(): Promise<OrganizeStatus> {
  return invoke("organize_status");
}

/**
 * Clear the application cache.
 */
export function clearCache(): Promise<void> {
  return invoke("clear_cache");
}
