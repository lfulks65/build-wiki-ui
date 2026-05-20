/**
 * Mock API — fallback implementations used when the app runs in a browser
 * (i.e. **not** inside a Tauri window).
 *
 * Each function returns a `Promise` that resolves after a realistic
 * delay (200–600 ms) so the loading / optimistic-update paths in the UI
 * are exercised during development.
 *
 * @module mock-api
 */

import type {
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
// Helpers
// ---------------------------------------------------------------------------

/** Simulate network latency: 200–600 ms. */
function delay(ms = 0): Promise<void> {
  const n = ms || 200 + Math.floor(Math.random() * 400);
  return new Promise((resolve) => setTimeout(resolve, n));
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const PAGES: PageSummary[] = [
  {
    title: "Getting Started",
    path: "getting-started.md",
    modified: "2025-05-15T09:30:00Z",
  },
  {
    title: "Architecture Overview",
    path: "architecture.md",
    modified: "2025-05-18T14:22:00Z",
  },
  {
    title: "API Reference",
    path: "api/reference.md",
    modified: "2025-05-17T11:45:00Z",
  },
  {
    title: "Asset Pipeline",
    path: "asset-pipeline.md",
    modified: "2025-05-16T08:10:00Z",
  },
  {
    title: "Curator Configuration",
    path: "curator/config.md",
    modified: "2025-05-14T16:55:00Z",
  },
  {
    title: "Deployment Guide",
    path: "deployment.md",
    modified: "2025-05-19T07:00:00Z",
  },
  {
    title: "Contributing Guidelines",
    path: "contributing.md",
    modified: "2025-05-13T12:30:00Z",
  },
];

const ASSETS: AssetSummary[] = [
  { id: "a1", filename: "architecture-diagram.png", type: "image", status: "complete", addedAt: "2025-05-18T14:22:00Z" },
  { id: "a2", filename: "api-schema.pdf", type: "pdf", status: "complete", addedAt: "2025-05-17T11:45:00Z" },
  { id: "a3", filename: "onboarding-walkthrough.mp3", type: "audio", status: "processing", addedAt: "2025-05-19T08:30:00Z" },
  { id: "a4", filename: "screenshot-v2.png", type: "image", status: "queued", addedAt: "2025-05-19T09:00:00Z" },
  { id: "a5", filename: "release-notes.pdf", type: "pdf", status: "complete", addedAt: "2025-05-16T10:00:00Z" },
  { id: "a6", filename: "demo-video.mp4", type: "video", status: "complete", addedAt: "2025-05-15T16:20:00Z" },
  { id: "a7", filename: "config-guide.md", type: "markdown", status: "failed", addedAt: "2025-05-14T14:10:00Z" },
  { id: "a8", filename: "team-photo.jpg", type: "image", status: "complete", addedAt: "2025-05-13T11:00:00Z" },
];

// Mock asset details
const ASSET_DETAILS: Record<string, AssetRecord> = {
  a1: {
    id: "a1",
    filename: "architecture-diagram.png",
    type: "image",
    status: "complete",
    mimeType: "image/png",
    fileSize: 2458624,
    width: 1920,
    height: 1080,
    originalFilename: "architecture-diagram.png",
    sourceUrl: "file:///vault/assets/architecture-diagram.png",
    ingestDate: "2025-05-18T14:22:00Z",
    modified: "2025-05-18T14:22:00Z",
    chunks: [
      { id: "c1", text: "Figure 1: System Architecture Overview. The diagram shows the client-server architecture with the Tauri frontend connecting to the Rust backend.", index: 0 },
      { id: "c2", text: "The backend manages a SQLite database for page storage and a file system for raw asset files. An asset curator runs periodically to process uploaded assets.", index: 1 },
      { id: "c3", text: "Key components include the Vault Manager (handles CRUD operations on pages), Asset Processor (handles image extraction, text parsing), and the Curator scheduler.", index: 2 },
    ],
    metadata: {
      "exif": {
        "Make": "Internal",
        "Model": "Screenshot",
        "DateTime": "2025-05-18T14:20:00Z",
      },
      "colorspace": "sRGB",
      "bitDepth": 24,
    },
    processingLog: [
      { id: "e1", stage: "ingestion", status: "completed", timestamp: "2025-05-18T14:22:01Z", details: "File received, 2.4 MB" },
      { id: "e2", stage: "validation", status: "completed", timestamp: "2025-05-18T14:22:02Z", details: "PNG format verified" },
      { id: "e3", stage: "thumbnail", status: "completed", timestamp: "2025-05-18T14:22:03Z", details: "150px thumbnail generated" },
      { id: "e4", stage: "extraction", status: "completed", timestamp: "2025-05-18T14:22:04Z", details: "Metadata extracted, 3 chunks identified" },
      { id: "e5", stage: "complete", status: "completed", timestamp: "2025-05-18T14:22:04Z", details: "Asset processing complete" },
    ],
  },
  a2: {
    id: "a2",
    filename: "api-schema.pdf",
    type: "pdf",
    status: "complete",
    mimeType: "application/pdf",
    fileSize: 1048576,
    originalFilename: "api-schema.pdf",
    ingestDate: "2025-05-17T11:45:00Z",
    modified: "2025-05-17T11:45:00Z",
    chunks: [
      { id: "c1", text: "API Schema v2.1 — Tauri Backend Commands. This document describes the Tauri command interface for the wiki application backend.", index: 0 },
      { id: "c2", text: "Available commands: get_vault_info, list_pages, read_page, write_page, search_pages, list_assets, get_curator_status, enqueue_curator.", index: 1 },
    ],
    metadata: { "pages": 12, "author": "Dev Team" },
    processingLog: [
      { id: "e1", stage: "ingestion", status: "completed", timestamp: "2025-05-17T11:45:01Z", details: "File received, 1.0 MB" },
      { id: "e2", stage: "pdf-parse", status: "completed", timestamp: "2025-05-17T11:45:03Z", details: "12 pages parsed" },
      { id: "e3", stage: "extraction", status: "completed", timestamp: "2025-05-17T11:45:04Z", details: "2 text chunks extracted" },
      { id: "e4", stage: "complete", status: "completed", timestamp: "2025-05-17T11:45:04Z", details: "Asset processing complete" },
    ],
  },
  a3: {
    id: "a3",
    filename: "onboarding-walkthrough.mp3",
    type: "audio",
    status: "processing",
    mimeType: "audio/mpeg",
    fileSize: 15728640,
    duration: 360,
    originalFilename: "onboarding-walkthrough.mp3",
    ingestDate: "2025-05-19T08:30:00Z",
    modified: "2025-05-19T08:30:00Z",
    chunks: [],
    metadata: { "bitrate": "320kbps", "sampleRate": "48000 Hz" },
    processingLog: [
      { id: "e1", stage: "ingestion", status: "completed", timestamp: "2025-05-19T08:30:01Z", details: "File received, 15.0 MB" },
      { id: "e2", stage: "validation", status: "completed", timestamp: "2025-05-19T08:30:02Z", details: "MP3 format verified" },
      { id: "e3", stage: "transcription", status: "in_progress", timestamp: "2025-05-19T08:30:05Z", details: "Transcribing audio..." },
    ],
  },
  a4: {
    id: "a4",
    filename: "screenshot-v2.png",
    type: "image",
    status: "queued",
    mimeType: "image/png",
    fileSize: 524288,
    width: 1440,
    height: 900,
    originalFilename: "screenshot-v2.png",
    ingestDate: "2025-05-19T09:00:00Z",
    modified: "2025-05-19T09:00:00Z",
    chunks: [],
    metadata: {},
    processingLog: [
      { id: "e1", stage: "ingestion", status: "completed", timestamp: "2025-05-19T09:00:01Z", details: "File queued" },
      { id: "e2", stage: "queued", status: "in_progress", timestamp: "2025-05-19T09:00:01Z", details: "Waiting for available processor" },
    ],
  },
  a5: {
    id: "a5",
    filename: "release-notes.pdf",
    type: "pdf",
    status: "complete",
    mimeType: "application/pdf",
    fileSize: 524288,
    originalFilename: "release-notes.pdf",
    ingestDate: "2025-05-16T10:00:00Z",
    modified: "2025-05-16T10:00:00Z",
    chunks: [
      { id: "c1", text: "Release Notes v1.0 — Initial release of the wiki application. Features include page management, asset processing, and full-text search.", index: 0 },
    ],
    metadata: { "pages": 5 },
    processingLog: [
      { id: "e1", stage: "ingestion", status: "completed", timestamp: "2025-05-16T10:00:01Z", details: "File received" },
      { id: "e2", stage: "complete", status: "completed", timestamp: "2025-05-16T10:00:03Z", details: "Asset processing complete" },
    ],
  },
  a6: {
    id: "a6",
    filename: "demo-video.mp4",
    type: "video",
    status: "complete",
    mimeType: "video/mp4",
    fileSize: 52428800,
    duration: 120,
    width: 1920,
    height: 1080,
    originalFilename: "demo-video.mp4",
    ingestDate: "2025-05-15T16:20:00Z",
    modified: "2025-05-15T16:20:00Z",
    chunks: [
      { id: "c1", text: "Demo: Wiki application overview. This video demonstrates the page editor, asset management, and search functionality.", index: 0 },
    ],
    metadata: { "codec": "h264", "fps": 30 },
    processingLog: [
      { id: "e1", stage: "ingestion", status: "completed", timestamp: "2025-05-15T16:20:01Z", details: "50 MB video received" },
      { id: "e2", stage: "frame-extract", status: "completed", timestamp: "2025-05-15T16:20:10Z", details: "Keyframe thumbnail extracted" },
      { id: "e3", stage: "complete", status: "completed", timestamp: "2025-05-15T16:20:10Z", details: "Asset processing complete" },
    ],
  },
  a7: {
    id: "a7",
    filename: "config-guide.md",
    type: "markdown",
    status: "failed",
    mimeType: "text/markdown",
    fileSize: 8192,
    originalFilename: "config-guide.md",
    ingestDate: "2025-05-14T14:10:00Z",
    modified: "2025-05-14T14:10:00Z",
    chunks: [],
    metadata: {},
    processingLog: [
      { id: "e1", stage: "ingestion", status: "completed", timestamp: "2025-05-14T14:10:01Z", details: "File received" },
      { id: "e2", stage: "markdown-parse", status: "failed", timestamp: "2025-05-14T14:10:02Z", details: "Parse error: unexpected token at line 42" },
      { id: "e3", stage: "failed", status: "failed", timestamp: "2025-05-14T14:10:02Z", details: "Processing terminated" },
    ],
  },
  a8: {
    id: "a8",
    filename: "team-photo.jpg",
    type: "image",
    status: "complete",
    mimeType: "image/jpeg",
    fileSize: 3145728,
    width: 4032,
    height: 3024,
    originalFilename: "team-photo.jpg",
    ingestDate: "2025-05-13T11:00:00Z",
    modified: "2025-05-13T11:00:00Z",
    chunks: [],
    metadata: { "exif": { "Make": "Apple", "Model": "iPhone 15" } },
    processingLog: [
      { id: "e1", stage: "ingestion", status: "completed", timestamp: "2025-05-13T11:00:01Z", details: "3.0 MB JPEG received" },
      { id: "e2", stage: "complete", status: "completed", timestamp: "2025-05-13T11:00:03Z", details: "Asset processing complete" },
    ],
  },
};

// ---------------------------------------------------------------------------
// API implementations
// ---------------------------------------------------------------------------

export function getVaultInfo(): Promise<VaultInfo> {
  return delay().then(
    (): VaultInfo => ({
      path: "/Users/dev/wiki/vault",
      name: "Build Wiki",
      pageCount: PAGES.length,
      assetCount: ASSETS.length,
    })
  );
}

export function listPages(): Promise<PageSummary[]> {
  return delay().then((): PageSummary[] => [...PAGES]);
}

export function readPage(path: string): Promise<string> {
  return delay().then((): string => {
    const page = PAGES.find((p) => p.path === path);
    if (!page) return `# Not Found\n\nPage "${path}" does not exist.`;
    return `# ${page.title}\n\nThis is mock content for **${page.title}**.\n\nLast modified: ${page.modified}\n\n<!-- real content served by Tauri backend when running in-app -->\n`;
  });
}

export function writePage(_path: string, _content: string): Promise<void> {
  return delay(300).then((): void => {});
}

export function searchPages(query: string): Promise<SearchResult[]> {
  return delay().then((): SearchResult[] => {
    const q = query.toLowerCase();
    const results: SearchResult[] = [];
    for (const page of PAGES) {
      if (page.title.toLowerCase().includes(q) || page.path.toLowerCase().includes(q)) {
        const idx = page.title.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 30);
        const snippet = page.title.substring(start, start + 80) + "…";
        results.push({ title: page.title, path: page.path, snippet, type: "page" });
      }
    }
    return results;
  });
}

export function listAssets(): Promise<AssetSummary[]> {
  return delay().then((): AssetSummary[] => [...ASSETS]);
}

export function getCuratorStatus(): Promise<CuratorStatus> {
  return delay().then((): CuratorStatus => ({
    running: false,
    idle: true,
    lastRun: new Date(Date.now() - 3600_000).toISOString(),
    queueDepth: 1,
  }));
}

export function enqueueCurator(_assetId: string): Promise<void> {
  return delay(400).then((): void => {});
}

// ---------------------------------------------------------------------------
// Mock asset detail / management functions
// ---------------------------------------------------------------------------

export function getAssetDetail(assetId: string): Promise<AssetRecord> {
  return delay().then(
    (): AssetRecord => {
      const record = ASSET_DETAILS[assetId];
      if (!record) {
        throw new Error(`Asset "${assetId}" not found`);
      }
      return { ...record };
    }
  );
}

export function deleteAsset(_assetId: string): Promise<void> {
  return delay(500).then((): void => {});
}

export function reprocessAsset(_assetId: string): Promise<void> {
  return delay(600).then((): void => {});
}

export function organizeAsset(_assetId: string): Promise<void> {
  return delay(400).then((): void => {});
}

export function getAssetChunks(
  assetId: string,
  _page?: number,
  _pageSize?: number
): Promise<{ chunks: AssetChunk[]; total: number; page: number }> {
  return delay().then((): { chunks: AssetChunk[]; total: number; page: number } => {
    const record = ASSET_DETAILS[assetId];
    if (!record) {
      throw new Error(`Asset "${assetId}" not found`);
    }
    const chunks = record.chunks ?? [];
    const page = _page ?? 1;
    const pageSize = _pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      chunks: chunks.slice(start, end),
      total: chunks.length,
      page,
    };
  });
}

export function getProcessingLog(assetId: string): Promise<ProcessingEvent[]> {
  return delay().then((): ProcessingEvent[] => {
    const record = ASSET_DETAILS[assetId];
    if (!record) {
      throw new Error(`Asset "${assetId}" not found`);
    }
    return record.processingLog ?? [];
  });
}
