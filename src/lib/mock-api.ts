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
  VaultRegistryEntry,
  VaultHealth,
  WorkerStatus,
  DiskUsage,
  LogError,
  OrganizeStatus,
  ApiKeyEntry,
  SystemStatus,
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

// Mock vault registry
const VAULT_REGISTRY: VaultRegistryEntry[] = [
  {
    id: "vault-1",
    name: "Build Wiki",
    path: "/Users/dev/wiki/vault",
    branch: "main",
    pageCount: PAGES.length,
    assetCount: ASSETS.length,
    isDefault: true,
    lastModified: "2025-05-19T07:00:00Z",
  },
  {
    id: "vault-2",
    name: "Dev Docs",
    path: "/Users/dev/docs",
    branch: "develop",
    pageCount: 23,
    assetCount: 5,
    isDefault: false,
    lastModified: "2025-05-18T10:30:00Z",
  },
];

// Mock API keys
const API_KEYS: ApiKeyEntry[] = [
  { key: "OPENROUTER_API_KEY", hasValue: true, required: false },
  { key: "GROQ_API_KEY", hasValue: false, required: false },
  { key: "GEMINI_API_KEY", hasValue: true, required: false },
  { key: "AWS_ACCESS_KEY_ID", hasValue: false, required: true },
  { key: "AWS_SECRET_ACCESS_KEY", hasValue: false, required: true },
];

// ---------------------------------------------------------------------------
// API implementations — original
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
// Vault Management — mock implementations
// ---------------------------------------------------------------------------

let _vaults: VaultRegistryEntry[] = [...VAULT_REGISTRY];
let _nextVaultId = 3;

export function listVaults(): Promise<VaultRegistryEntry[]> {
  return delay(150).then((): VaultRegistryEntry[] => [..._vaults]);
}

export function initVault(name: string, path: string): Promise<VaultRegistryEntry> {
  return delay(400).then((): VaultRegistryEntry => {
    const entry: VaultRegistryEntry = {
      id: `vault-${_nextVaultId++}`,
      name,
      path,
      branch: "main",
      pageCount: 0,
      assetCount: 0,
      isDefault: false,
      lastModified: new Date().toISOString(),
    };
    _vaults.push(entry);
    return entry;
  });
}

export function cloneVault(url: string, localPath: string): Promise<VaultRegistryEntry> {
  return delay(600).then((): VaultRegistryEntry => {
    const name = url.split("/").pop()?.replace(/\.git$/, "") ?? "Cloned Vault";
    const entry: VaultRegistryEntry = {
      id: `vault-${_nextVaultId++}`,
      name,
      path: localPath,
      branch: "main",
      pageCount: 10,
      assetCount: 2,
      isDefault: false,
      lastModified: new Date().toISOString(),
    };
    _vaults.push(entry);
    return entry;
  });
}

export function setDefaultVault(vaultId: string): Promise<void> {
  return delay(200).then((): void => {
    _vaults = _vaults.map((v) => ({
      ...v,
      isDefault: v.id === vaultId,
    }));
  });
}

export function removeVault(vaultId: string): Promise<void> {
  return delay(200).then((): void => {
    _vaults = _vaults.filter((v) => v.id !== vaultId);
  });
}

export function openVault(vaultId: string): Promise<void> {
  return delay(200).then((): void => {
    if (!_vaults.some((v) => v.id === vaultId)) {
      throw new Error(`Vault ${vaultId} not found`);
    }
  });
}

export function getVaultHealth(vaultId: string): Promise<VaultHealth> {
  return delay(250).then((): VaultHealth => {
    const vault = _vaults.find((v) => v.id === vaultId);
    if (!vault) {
      return { pathExists: false, gitRepoValid: false, indexUpToDate: false, error: "Vault not found" };
    }
    return {
      pathExists: true,
      gitRepoValid: true,
      indexUpToDate: true,
      error: null,
    };
  });
}

// ---------------------------------------------------------------------------
// API Key Management — mock implementations
// ---------------------------------------------------------------------------

let _apiKeys: ApiKeyEntry[] = API_KEYS.map((k) => ({ ...k }));
const _keyValues: Record<string, string> = {
  OPENROUTER_API_KEY: "sk-or-v1-abc123def456",
  GEMINI_API_KEY: "AIzaSy-abcdef123456",
};

export function listApiKeys(): Promise<ApiKeyEntry[]> {
  return delay(100).then((): ApiKeyEntry[] => [..._apiKeys]);
}

export function getApiKey(key: string, full = false): Promise<string> {
  return delay(100).then((): string => {
    const entry = _apiKeys.find((k) => k.key === key);
    if (!entry || !entry.hasValue) return "";
    const val = _keyValues[key] ?? "";
    if (full) return val;
    if (val.length <= 8) return "••••••••";
    return val.slice(0, 4) + "•".repeat(val.length - 8) + val.slice(-4);
  });
}

export function setApiKey(key: string, value: string): Promise<void> {
  return delay(200).then((): void => {
    let entry = _apiKeys.find((k) => k.key === key);
    if (!entry) {
      entry = { key, hasValue: true, required: key.startsWith("AWS_") };
      _apiKeys.push(entry);
    } else {
      entry.hasValue = true;
    }
    _keyValues[key] = value;
  });
}

export function deleteApiKey(key: string): Promise<void> {
  return delay(200).then((): void => {
    _apiKeys = _apiKeys.map((k) => (k.key === key ? { ...k, hasValue: false } : k));
    delete _keyValues[key];
  });
}

export function testApiKeyConnection(key: string): Promise<boolean> {
  return delay(800).then((): boolean => {
    const entry = _apiKeys.find((k) => k.key === key);
    return entry !== undefined && entry.hasValue;
  });
}

// ---------------------------------------------------------------------------
// System Status — mock implementations
// ---------------------------------------------------------------------------

export function getSystemStatus(): Promise<SystemStatus> {
  return delay(300).then((): SystemStatus => ({
    vaults: _vaults.map((v) => ({
      pathExists: true,
      gitRepoValid: true,
      indexUpToDate: true,
      error: null,
    })),
    worker: {
      running: true,
      pid: 12345,
      uptime: 86400,
      logPath: "/tmp/wiki-worker.log",
      state: "running",
    },
    disk: {
      vaultSize: 15728640, // 15 MB
      blobSize: 5242880, // 5 MB
    },
    recentErrors: [
      {
        timestamp: new Date(Date.now() - 3600_000).toISOString(),
        level: "error",
        message: "Failed to process asset: image too large (12MB)",
      },
      {
        timestamp: new Date(Date.now() - 7200_000).toISOString(),
        level: "warn",
        message: "Index rebuild took longer than expected (45s)",
      },
      {
        timestamp: new Date(Date.now() - 86400_000).toISOString(),
        level: "error",
        message: "Git checkout failed: branch 'feature-x' not found",
      },
    ],
  }));
}

export function indexRebuild(_vaultId: string): Promise<void> {
  return delay(2000).then((): void => {});
}

export function lintVault(_vaultId: string): Promise<string[]> {
  return delay(500).then((): string[] => [
    // "warning: page 'old-page.md' has no frontmatter",
    // "error: broken link in 'index.md' → /nonexistent",
  ]);
}

export function organizeStatus(): Promise<OrganizeStatus> {
  return delay(200).then((): OrganizeStatus => ({
    totalFiles: 156,
    organizedCount: 150,
    orphanedCount: 4,
    pendingMoves: 2,
  }));
}

export function clearCache(): Promise<void> {
  return delay(300).then((): void => {});
}
