/**
 * API barrel export with automatic environment detection.
 *
 * When running **inside Tauri** (`window.__TAURI_INTERNALS__` present),
 * functions delegate to `tauri-api` (real `invoke` calls).
 *
 * When running **in a browser** (development, `vite dev`), they fall
 * back to `mock-api` which returns realistic stub data.
 *
 * This file re-exports every symbol so consumers can simply write:
 * ```ts
 * import { getVaultInfo, listPages, isTauri } from "@/lib/api";
 * ```
 *
 * @module api
 */

// ---------------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------------

/**
 * Return `true` when the code is executing inside a Tauri window.
 *
 * We check for `__TAURI_INTERNALS__` because it is injected by the Tauri
 * JS runtime and is *not* available in a plain browser.
 */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

// ---------------------------------------------------------------------------
// Re-export types from tauri-api (always available, no env check needed)
// ---------------------------------------------------------------------------

export type {
  PageSummary,
  AssetSummary,
  AssetRecord,
  AssetChunk,
  ProcessingEvent,
  IngestProgress,
  VaultInfo,
  SearchResult,
  CuratorStatus,
} from "./tauri-api";

// ---------------------------------------------------------------------------
// Select implementation at runtime
// ---------------------------------------------------------------------------

import {
  getVaultInfo as tauriGetVaultInfo,
  listPages as tauriListPages,
  readPage as tauriReadPage,
  writePage as tauriWritePage,
  searchPages as tauriSearchPages,
  listAssets as tauriListAssets,
  getCuratorStatus as tauriGetCuratorStatus,
  enqueueCurator as tauriEnqueueCurator,
  getAssetDetail as tauriGetAssetDetail,
  deleteAsset as tauriDeleteAsset,
  reprocessAsset as tauriReprocessAsset,
  organizeAsset as tauriOrganizeAsset,
  getAssetChunks as tauriGetAssetChunks,
  getProcessingLog as tauriGetProcessingLog,
} from "./tauri-api";

import {
  getVaultInfo as mockGetVaultInfo,
  listPages as mockListPages,
  readPage as mockReadPage,
  writePage as mockWritePage,
  searchPages as mockSearchPages,
  listAssets as mockListAssets,
  getCuratorStatus as mockGetCuratorStatus,
  enqueueCurator as mockEnqueueCurator,
  getAssetDetail as mockGetAssetDetail,
  deleteAsset as mockDeleteAsset,
  reprocessAsset as mockReprocessAsset,
  organizeAsset as mockOrganizeAsset,
  getAssetChunks as mockGetAssetChunks,
  getProcessingLog as mockGetProcessingLog,
} from "./mock-api";

/** `true` in dev/browser mode → use mock functions. */
const _useMock = !isTauri();

/** Get vault information. */
export const getVaultInfo = _useMock ? mockGetVaultInfo : tauriGetVaultInfo;
/** List all wiki pages. */
export const listPages = _useMock ? mockListPages : tauriListPages;
/** Read a page by path. */
export const readPage = _useMock ? mockReadPage : tauriReadPage;
/** Write a page by path. */
export const writePage = _useMock ? mockWritePage : tauriWritePage;
/** Search wiki pages. */
export const searchPages = _useMock ? mockSearchPages : tauriSearchPages;
/** List all assets. */
export const listAssets = _useMock ? mockListAssets : tauriListAssets;
/** Get curator status. */
export const getCuratorStatus = _useMock ? mockGetCuratorStatus : tauriGetCuratorStatus;
/** Enqueue an asset for the curator. */
export const enqueueCurator = _useMock ? mockEnqueueCurator : tauriEnqueueCurator;

/** Get full asset detail record. */
export const getAssetDetail = _useMock ? mockGetAssetDetail : tauriGetAssetDetail;
/** Delete an asset. */
export const deleteAsset = _useMock ? mockDeleteAsset : tauriDeleteAsset;
/** Re-process an asset. */
export const reprocessAsset = _useMock ? mockReprocessAsset : tauriReprocessAsset;
/** Organize (enqueue curator) an asset. */
export const organizeAsset = _useMock ? mockOrganizeAsset : tauriOrganizeAsset;
/** Get paginated text chunks for an asset. */
export const getAssetChunks = _useMock ? mockGetAssetChunks : tauriGetAssetChunks;
/** Get processing log for an asset. */
export const getProcessingLog = _useMock ? mockGetProcessingLog : tauriGetProcessingLog;
