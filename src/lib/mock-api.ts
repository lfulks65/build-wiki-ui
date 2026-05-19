/**
 * Mock API — fallback implementations for browser development.
 * Each function simulates network latency (200–600 ms).
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

function delay(ms = 0): Promise<void> {
  const n = ms || 200 + Math.floor(Math.random() * 400);
  return new Promise((resolve) => setTimeout(resolve, n));
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const PAGES: PageSummary[] = [
  { title: "Getting Started", path: "getting-started.md", modified: "2025-05-15T09:30:00Z" },
  { title: "Architecture Overview", path: "architecture.md", modified: "2025-05-18T14:22:00Z" },
  { title: "API Reference", path: "api/reference.md", modified: "2025-05-17T11:45:00Z" },
  { title: "Asset Pipeline", path: "asset-pipeline.md", modified: "2025-05-16T08:10:00Z" },
  { title: "Curator Configuration", path: "curator/config.md", modified: "2025-05-14T16:55:00Z" },
  { title: "Deployment Guide", path: "deployment.md", modified: "2025-05-19T07:00:00Z" },
  { title: "Contributing Guidelines", path: "contributing.md", modified: "2025-05-13T12:30:00Z" },
];

const ASSETS: AssetSummary[] = [
  { id: "a1", filename: "architecture-diagram.png", type: "image", status: "complete" },
  { id: "a2", filename: "api-schema.pdf", type: "pdf", status: "complete" },
  { id: "a3", filename: "onboarding-walkthrough.mp3", type: "audio", status: "processing" },
  { id: "a4", filename: "screenshot-v2.png", type: "image", status: "queued" },
  { id: "a5", filename: "release-notes.pdf", type: "pdf", status: "complete" },
];

const PAGE_CONTENTS: Record<string, string> = {
  "getting-started.md": `# Getting Started with Build Wiki

Welcome to **Build Wiki** — your centralized knowledge base.

## What is Build Wiki?

Build Wiki is a documentation system that helps teams:

- Share knowledge across projects
- Document APIs, architecture, and processes
- Keep information up-to-date and discoverable

## Quick Start

### Installation

Install the Build Wiki CLI tool:

\`\`\`bash
npm install -g @build/wiki-cli
\`\`\`

Then initialize a new wiki:

\`\`\`bash
build-wiki init my-project
build-wiki serve --port 3000
\`\`\`

### Writing Your First Page

Create a new file with \`yaml frontmatter\` for metadata:

---
title: API Reference
date: 2024-01-15
tags: [api, reference]
---

# API Reference

All endpoints return JSON...

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| \`port\` | 3000 | Server port |
| \`host\` | localhost | Bind address |

> **Warning:** Always back up your wiki data before running migrations.

## Next Steps

Check out the [Architecture Guide](architecture.md) for details on how the system works.`,
  "architecture.md": `# Architecture Overview

Build Wiki follows a **hexagonal architecture** with ports (traits) and adapters.

## Core Components

1. **Vault** — The unit of knowledge, stored as markdown files on disk
2. **Curator** — Autonomous agent that maintains pages through ingest and lint loops
3. **Search** — SQLite FTS5-powered full-text search across all pages
4. **Asset Pipeline** — Handles file ingestion, processing, and indexing

## Data Flow

\`\`\`
User → AssetService → Curator → Page Updates → Search Index
\`\`\`

## Key Design Principles

- **Compounding knowledge** — Information integrates over time
- **Markdown-first** — All content is plain-text Markdown
- **Local-first** — Data lives on disk, no cloud dependency`,
  "api/reference.md": `# API Reference

All endpoints return JSON with consistent error formatting.

## Endpoints

### GET /api/pages
List all wiki pages.

### GET /api/pages/:path
Get page content by path.

### PUT /api/pages/:path
Write or update a page.

### POST /api/search
Search pages by query.

## Error Format

\`\`\`json
{
  "error": "Page not found",
  "code": 404
}
\`\`\`
`,
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
    if (PAGE_CONTENTS[path]) return PAGE_CONTENTS[path];
    return `# Not Found\n\nPage "${path}" does not exist.`;
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
