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
  QueueJob,
  RunningJob,
  OrganizeStatus,
  CuratorLogEntry,
  CuratorLogResponse,
  EnqueueResult,
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

/** Generate a realistic asset filename from an asset id. */
function assetFileName(assetId: string): string {
  const names = [
    "Q4_Earnings_Deck.pdf",
    "product-roadmap-2026.png",
    "api-docs-migration.md",
    "meeting-notes-5-18.mp3",
    "feature-spec-auth.md",
    "architecture-diagram.svg",
    "user-research-findings.pptx",
    "security-audit-report.pdf",
    "sprint-retrospective.docx",
    "design-system-v2.fig",
  ];
  const idx = parseInt(assetId.slice(-2), 16) % names.length;
  return names[idx] || `asset-${assetId}.md`;
}

// ---------------------------------------------------------------------------
// API implementations — legacy commands
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

// ---------------------------------------------------------------------------
// Curator Dashboard mock implementations
// ---------------------------------------------------------------------------

/** Generate mock queue jobs. */
function generateQueueJobs(): { queued: QueueJob[]; running: RunningJob[]; done: QueueJob[]; failed: QueueJob[] } {
  const now = Date.now();
  const queued: QueueJob[] = [
    {
      jobId: "ingest-a4-1715200512345-0",
      kind: "ingest",
      subject: "a4",
      enqueuedAt: new Date(now - 300_000).toISOString(),
      startedAt: null,
      finishedAt: null,
      lastError: null,
      attempts: 0,
    },
    {
      jobId: "ingest-001-1715200513000-0",
      kind: "ingest",
      subject: "a4",
      enqueuedAt: new Date(now - 60_000).toISOString(),
      startedAt: null,
      finishedAt: null,
      lastError: null,
      attempts: 0,
    },
  ];

  const running: RunningJob[] = [
    {
      job: {
        jobId: "ingest-a3-1715200514000-0",
        kind: "ingest",
        subject: "a3",
        enqueuedAt: new Date(now - 120_000).toISOString(),
        startedAt: new Date(now - 60_000).toISOString(),
        finishedAt: null,
        lastError: null,
        attempts: 1,
      },
      instance: "wiki-12345-1715200513000",
    },
  ];

  const done: QueueJob[] = [
    {
      jobId: "ingest-a1-1715200500000-0",
      kind: "ingest",
      subject: "a1",
      enqueuedAt: new Date(now - 7200_000).toISOString(),
      startedAt: new Date(now - 7200_000).toISOString(),
      finishedAt: new Date(now - 7060_000).toISOString(),
      lastError: null,
      attempts: 1,
    },
    {
      jobId: "ingest-a5-1715200480000-0",
      kind: "ingest",
      subject: "a5",
      enqueuedAt: new Date(now - 10800_000).toISOString(),
      startedAt: new Date(now - 10800_000).toISOString(),
      finishedAt: new Date(now - 10700_000).toISOString(),
      lastError: null,
      attempts: 1,
    },
    {
      jobId: "ingest-002-1715200460000-0",
      kind: "ingest",
      subject: "a2",
      enqueuedAt: new Date(now - 14400_000).toISOString(),
      startedAt: new Date(now - 14400_000).toISOString(),
      finishedAt: new Date(now - 14300_000).toISOString(),
      lastError: null,
      attempts: 1,
    },
  ];

  const failed: QueueJob[] = [
    {
      jobId: "ingest-003-1715200440000-0",
      kind: "ingest",
      subject: "a3",
      enqueuedAt: new Date(now - 18000_000).toISOString(),
      startedAt: new Date(now - 18000_000).toISOString(),
      finishedAt: new Date(now - 17955_000).toISOString(),
      lastError: "Transcription service returned HTTP 502",
      attempts: 2,
    },
  ];

  return { queued, running, done, failed };
}

/** Generate mock curator log entries. */
function generateCuratorLog(totalEntries: number): CuratorLogEntry[] {
  const models = ["gpt-4o", "claude-sonnet-4", "gemini-pro"];
  const loopNames = ["ingest", "writeback"];
  const rationales = [
    "Generated 3 pages from PDF content with proper headings.",
    "No significant edits needed — content already well-structured.",
    "Updated existing page with new information, corrected links.",
    "Transcription complete; generated glossary and index pages.",
    "Batch cap hit after 50 edits — will continue in next loop.",
  ];

  const entries: CuratorLogEntry[] = [];
  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; i < totalEntries; i++) {
    const duration = 20 + Math.floor(Math.random() * 180);
    entries.push({
      runId: `r-${Date.now() - i * 300_000}`,
      loopName: loopNames[i % loopNames.length],
      assetId: `asset-${String(i).padStart(2, "0")}`,
      model: models[i % models.length],
      startedAt: now - i * 3600,
      finishedAt: now - i * 3600 + duration,
      editsApplied: Math.floor(Math.random() * 50),
      batchCapped: i % 7 === 0,
      rationale: rationales[i % rationales.length],
      tokensUsed: {
        promptTokens: Math.floor(500 + Math.random() * 4500),
        completionTokens: Math.floor(200 + Math.random() * 2000),
        cachedPromptTokens: Math.floor(Math.random() * 2000),
      },
    });
  }
  return entries;
}

export function organizeStatus(): Promise<OrganizeStatus> {
  return delay(300).then((): OrganizeStatus => {
    const jobs = generateQueueJobs();
    return {
      queued: jobs.queued,
      running: jobs.running,
      done: jobs.done,
      failed: jobs.failed,
      pid: 12345,
      logPath: "/Users/dev/wiki/.wiki/cache/jobs/worker.log",
      queueDepth: jobs.queued.length,
    };
  });
}

export function curatorLog(
  limit: number = 20,
  offset: number = 0
): Promise<CuratorLogResponse> {
  return delay(300).then((): CuratorLogResponse => {
    const allEntries = generateCuratorLog(80);
    const sliced = allEntries.slice(offset, offset + limit);
    return {
      total: allEntries.length,
      entries: sliced,
      offset,
      limit,
    };
  });
}

let _workerRunning = false;

export function workerStart(): Promise<number> {
  return delay(500).then((): number => {
    _workerRunning = true;
    return 54321;
  });
}

export function workerStop(): Promise<boolean> {
  return delay(500).then((): boolean => {
    _workerRunning = false;
    return true;
  });
}

export function organizeEnqueue(assetId: string): Promise<EnqueueResult> {
  return delay(400).then((): EnqueueResult => {
    return {
      jobId: `ingest-${assetId}-${Date.now()}-0`,
      fresh: true,
    };
  });
}

export function organizeEnqueueAll(): Promise<number> {
  return delay(600).then((): number => {
    return 3; // mock: enqueued 3 assets
  });
}

export function organizeIngestFile(_filePath: string): Promise<string> {
  return delay(500).then((): string => {
    return `import-${Date.now()}-0`;
  });
}
