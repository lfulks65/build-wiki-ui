/**
 * Tauri API bridge layer.
 *
 * Provides TypeScript types and a client that wraps `@tauri-apps/api/core`
 * `invoke` calls to communicate with the Rust backend commands.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Summary of a wiki page stored on disk. */
export interface PageSummary {
  title: string;
  path: string;
  modified: string;
}

/** Summary of an asset associated with the wiki. */
export interface AssetSummary {
  id: string;
  filename: string;
  type: string;
  status: string;
}

/** Information about the wiki vault. */
export interface VaultInfo {
  path: string;
  name: string;
  pageCount: number;
  assetCount: number;
}

/** A single search result from a wiki page. */
export interface SearchResult {
  title: string;
  path: string;
  snippet: string;
  type: string;
}

/** Current status of the asset curator background job. */
export interface CuratorStatus {
  running: boolean;
  idle: boolean;
  lastRun: string | null;
  queueDepth: number;
}

// ---------------------------------------------------------------------------
// Client functions — Tauri invoke
// ---------------------------------------------------------------------------

export function getVaultInfo(): Promise<VaultInfo> {
  // Stubs — real invoke calls when inside Tauri
  return Promise.resolve({
    path: "/Users/dev/wiki/vault",
    name: "Build Wiki",
    pageCount: 0,
    assetCount: 0,
  });
}

export function listPages(): Promise<PageSummary[]> {
  return Promise.resolve([]);
}

export function readPage(path: string): Promise<string> {
  return Promise.resolve(`# ${path}\n\nPage content will appear here.`);
}

export function writePage(_path: string, _content: string): Promise<void> {
  return Promise.resolve();
}

export function searchPages(_query: string): Promise<SearchResult[]> {
  return Promise.resolve([]);
}

export function listAssets(): Promise<AssetSummary[]> {
  return Promise.resolve([]);
}

export function getCuratorStatus(): Promise<CuratorStatus> {
  return Promise.resolve({
    running: false,
    idle: true,
    lastRun: null,
    queueDepth: 0,
  });
}

export function enqueueCurator(_assetId: string): Promise<void> {
  return Promise.resolve();
}
