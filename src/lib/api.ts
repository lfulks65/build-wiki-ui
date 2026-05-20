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
  VaultRegistryEntry,
  SearchResult,
  CuratorStatus,
  VaultHealth,
  WorkerStatus,
  DiskUsage,
  LogError,
  OrganizeStatus,
  ApiKeyEntry,
  SystemStatus,
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
  listVaults as tauriListVaults,
  initVault as tauriInitVault,
  cloneVault as tauriCloneVault,
  setDefaultVault as tauriSetDefaultVault,
  removeVault as tauriRemoveVault,
  openVault as tauriOpenVault,
  getVaultHealth as tauriGetVaultHealth,
  listApiKeys as tauriListApiKeys,
  getApiKey as tauriGetApiKey,
  setApiKey as tauriSetApiKey,
  deleteApiKey as tauriDeleteApiKey,
  testApiKeyConnection as tauriTestApiKeyConnection,
  getSystemStatus as tauriGetSystemStatus,
  indexRebuild as tauriIndexRebuild,
  lintVault as tauriLintVault,
  organizeStatus as tauriOrganizeStatus,
  clearCache as tauriClearCache,
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
  listVaults as mockListVaults,
  initVault as mockInitVault,
  cloneVault as mockCloneVault,
  setDefaultVault as mockSetDefaultVault,
  removeVault as mockRemoveVault,
  openVault as mockOpenVault,
  getVaultHealth as mockGetVaultHealth,
  listApiKeys as mockListApiKeys,
  getApiKey as mockGetApiKey,
  setApiKey as mockSetApiKey,
  deleteApiKey as mockDeleteApiKey,
  testApiKeyConnection as mockTestApiKeyConnection,
  getSystemStatus as mockGetSystemStatus,
  indexRebuild as mockIndexRebuild,
  lintVault as mockLintVault,
  organizeStatus as mockOrganizeStatus,
  clearCache as mockClearCache,
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

// Vault management
export const listVaults = _useMock ? mockListVaults : tauriListVaults;
export const initVault = _useMock ? mockInitVault : tauriInitVault;
export const cloneVault = _useMock ? mockCloneVault : tauriCloneVault;
export const setDefaultVault = _useMock ? mockSetDefaultVault : tauriSetDefaultVault;
export const removeVault = _useMock ? mockRemoveVault : tauriRemoveVault;
export const openVault = _useMock ? mockOpenVault : tauriOpenVault;
export const getVaultHealth = _useMock ? mockGetVaultHealth : tauriGetVaultHealth;

// API key management
export const listApiKeys = _useMock ? mockListApiKeys : tauriListApiKeys;
export const getApiKey = _useMock ? mockGetApiKey : tauriGetApiKey;
export const setApiKey = _useMock ? mockSetApiKey : tauriSetApiKey;
export const deleteApiKey = _useMock ? mockDeleteApiKey : tauriDeleteApiKey;
export const testApiKeyConnection = _useMock ? mockTestApiKeyConnection : tauriTestApiKeyConnection;

// System status
export const getSystemStatus = _useMock ? mockGetSystemStatus : tauriGetSystemStatus;
export const indexRebuild = _useMock ? mockIndexRebuild : tauriIndexRebuild;
export const lintVault = _useMock ? mockLintVault : tauriLintVault;
export const organizeStatus = _useMock ? mockOrganizeStatus : tauriOrganizeStatus;
export const clearCache = _useMock ? mockClearCache : tauriClearCache;
