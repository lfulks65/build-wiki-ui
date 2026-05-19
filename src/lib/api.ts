/**
 * API barrel export.
 *
 * In browser mode (development), delegates to mock-api.
 * In Tauri mode (production app), delegates to tauri-api.
 */

export type {
  PageSummary,
  AssetSummary,
  VaultInfo,
  SearchResult,
  CuratorStatus,
} from "./tauri-api";

// Always import both; the runtime check picks which one to use
import * as tauriApi from "./tauri-api";
import * as mockApi from "./mock-api";

/** True when running in a browser (not inside Tauri). */
const useMock = typeof window !== "undefined" && !("__TAURI_INTERNALS__" in window);

/** Get vault information. */
export const getVaultInfo = useMock ? mockApi.getVaultInfo : tauriApi.getVaultInfo;
/** List all wiki pages. */
export const listPages = useMock ? mockApi.listPages : tauriApi.listPages;
/** Read a page by path. */
export const readPage = useMock ? mockApi.readPage : tauriApi.readPage;
/** Write a page by path. */
export const writePage = useMock ? mockApi.writePage : tauriApi.writePage;
/** Search wiki pages. */
export const searchPages = useMock ? mockApi.searchPages : tauriApi.searchPages;
/** List all assets. */
export const listAssets = useMock ? mockApi.listAssets : tauriApi.listAssets;
/** Get curator status. */
export const getCuratorStatus = useMock ? mockApi.getCuratorStatus : tauriApi.getCuratorStatus;
/** Enqueue an asset for the curator. */
export const enqueueCurator = useMock ? mockApi.enqueueCurator : tauriApi.enqueueCurator;
