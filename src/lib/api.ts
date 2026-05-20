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
  VaultInfo,
  SearchResult,
  CuratorStatus,
  BacklinkEntry,
} from "./tauri-api";

// ---------------------------------------------------------------------------
// Select implementation at runtime
// ---------------------------------------------------------------------------

import {
  getVaultInfo as tauriGetVaultInfo,
  listPages as tauriListPages,
  readPage as tauriReadPage,
  writePage as tauriWritePage,
  deletePage as tauriDeletePage,
  searchPages as tauriSearchPages,
  listAssets as tauriListAssets,
  getCuratorStatus as tauriGetCuratorStatus,
  enqueueCurator as tauriEnqueueCurator,
  pageBacklinks as tauriPageBacklinks,
} from "./tauri-api";

import {
  getVaultInfo as mockGetVaultInfo,
  listPages as mockListPages,
  readPage as mockReadPage,
  writePage as mockWritePage,
  deletePage as mockDeletePage,
  searchPages as mockSearchPages,
  listAssets as mockListAssets,
  getCuratorStatus as mockGetCuratorStatus,
  enqueueCurator as mockEnqueueCurator,
  pageBacklinks as mockPageBacklinks,
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
/** Delete a page by path. */
export const deletePage = _useMock ? mockDeletePage : tauriDeletePage;
/** Search wiki pages. */
export const searchPages = _useMock ? mockSearchPages : tauriSearchPages;
/** List all assets. */
export const listAssets = _useMock ? mockListAssets : tauriListAssets;
/** Get curator status. */
export const getCuratorStatus = _useMock ? mockGetCuratorStatus : tauriGetCuratorStatus;
/** Enqueue an asset for the curator. */
export const enqueueCurator = _useMock ? mockEnqueueCurator : tauriEnqueueCurator;
/** Get backlinks for a page. */
export const pageBacklinks = _useMock ? mockPageBacklinks : tauriPageBacklinks;
