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
  { id: "a1", filename: "architecture-diagram.png", type: "image", status: "complete" },
  { id: "a2", filename: "api-schema.pdf", type: "pdf", status: "complete" },
  { id: "a3", filename: "onboarding-walkthrough.mp3", type: "audio", status: "processing" },
  { id: "a4", filename: "screenshot-v2.png", type: "image", status: "queued" },
  { id: "a5", filename: "release-notes.pdf", type: "pdf", status: "complete" },
];

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
  // In mock mode writes are a no-op (or could mutate the in-memory mock data)
  return delay(300).then((): void => {});
}

export function searchPages(query: string): Promise<SearchResult[]> {
  return delay().then((): SearchResult[] => {
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const page of PAGES) {
      if (
        page.title.toLowerCase().includes(q) ||
        page.path.toLowerCase().includes(q)
      ) {
        const idx = page.title.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 30);
        const snippet =
          page.title.substring(start, start + 80) + "…";
        results.push({
          title: page.title,
          path: page.path,
          snippet,
          type: "page",
        });
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
