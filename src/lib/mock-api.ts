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
  BacklinkEntry,
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
    tags: ["tutorial", "onboarding"],
    snippet: "Welcome to Build Wiki — your knowledge base for the Build project.",
  },
  {
    title: "Architecture Overview",
    path: "architecture.md",
    modified: "2025-05-18T14:22:00Z",
    tags: ["architecture", "design"],
    snippet: "The wiki uses a persistent, compounding knowledge model built on interlinked Markdown pages.",
  },
  {
    title: "API Reference",
    path: "api/reference.md",
    modified: "2025-05-17T11:45:00Z",
    tags: ["api", "reference"],
    snippet: "All endpoints return JSON. The API follows REST conventions with versioned routes.",
  },
  {
    title: "Asset Pipeline",
    path: "asset-pipeline.md",
    modified: "2025-05-16T08:10:00Z",
    tags: ["assets", "pipeline"],
    snippet: "Assets are ingested through a processing pipeline with status tracking and validation.",
  },
  {
    title: "Curator Configuration",
    path: "curator/config.md",
    modified: "2025-05-14T16:55:00Z",
    tags: ["curator", "configuration", "ai"],
    snippet: "Configure the Curator agent's model, API keys, and batch processing limits.",
  },
  {
    title: "Deployment Guide",
    path: "deployment.md",
    modified: "2025-05-19T07:00:00Z",
    tags: ["deployment", "infrastructure"],
    snippet: "Deploy Build Wiki to production with Docker, Kubernetes, or bare metal.",
  },
  {
    title: "Contributing Guidelines",
    path: "contributing.md",
    modified: "2025-05-13T12:30:00Z",
    tags: ["community", "guidelines"],
    snippet: "How to contribute to Build Wiki: code style, PR process, and community standards.",
  },
];

const PAGE_CONTENT: Record<string, string> = {
  "getting-started.md": `---
title: Getting Started
date: 2025-05-15
tags: [tutorial, onboarding]
---

# Getting Started with Build Wiki

Welcome to **Build Wiki** — your centralized knowledge base.

## What is Build Wiki?

Build Wiki is a documentation system that helps teams:

- Share knowledge across projects
- Document APIs, architecture, and processes
- Keep information up-to-date and discoverable

## Quick Start

### Installation

\`\`\`bash
npm install -g @build/wiki-cli
\`\`\`

Then initialize a new wiki:

\`\`\`bash
build-wiki init my-project
build-wiki serve --port 3000
\`\`\`

## Writing Your First Page

Create a new file with \`yaml frontmatter\` for metadata:

---
title: API Reference
date: 2024-01-15
tags: [api, reference]
---

# API Reference

All endpoints return JSON...

## Next Steps

Check out the [API Reference](api/reference.md) for
detailed endpoint specifications.

See also: [Architecture Overview](architecture.md)`,

  "architecture.md": `# Architecture Overview

The wiki is a persistent, compounding artifact. Instead of re-deriving
answers from raw documents on every query (RAG-style), an LLM curator
reads new sources once and integrates them into a structured, interlinked
Markdown wiki.

## Core Components

### The Vault

The vault is the unit of knowledge. It contains:

- \`wiki/\` — Markdown pages
- \`assets/\` — Binary attachments
- \`.wiki/\` — Configuration and state

### The Curator

The Curator agent maintains pages through:

1. **Ingest fan-out** — Reads new sources
2. **Query write-back** — Updates pages from queries
3. **Scheduled lint loops** — Keeps quality high

### Search

Search is powered by SQLite FTS5 for fast, full-text retrieval across
all page content.

See [API Reference](api/reference.md) for the search API endpoints.

For deployment see [Deployment Guide](deployment.md).`,

  "api/reference.md": `# API Reference

All endpoints return JSON. The API follows REST conventions with
versioned routes under \`/api/v1/\`.

## Authentication

All endpoints require an API key in the \`X-API-Key\` header.

## Endpoints

### GET /pages

List all wiki pages with summary metadata.

**Response:**

\`\`\`json
{
  "pages": [
    { "title": "Getting Started", "path": "getting-started.md" }
  ]
}
\`\`\`

### GET /pages/:slug

Read a single page by its slug.

### POST /pages

Create or update a page.

> **Warning:** Always back up your wiki data before running API writes.

For details on the asset pipeline, see [Asset Pipeline](asset-pipeline.md).`,

  "asset-pipeline.md": `# Asset Pipeline

Assets are ingested through a processing pipeline with status tracking
and validation.

## Pipeline Stages

1. **Ingest** — File uploaded, hash computed
2. **Processing** — Thumbnail generated, metadata extracted
3. **Complete** — Asset ready for use
4. **Failed** — Processing error (manual review needed)

## Status Codes

| Status | Description |
|--------|-------------|
| \`queued\` | Awaiting processing |
| \`processing\` | Currently being processed |
| \`complete\` | Ready for use |
| \`failed\` | Processing error |

See [Curator Configuration](curator/config.md) for processing limits.`,

  "curator/config.md": `# Curator Configuration

Configure the Curator agent's model, API keys, and batch processing limits.

## Configuration File

The curator reads \`.wiki/config.yaml\` from the vault root:

\`\`\`yaml
curator:
  model: "gpt-4-turbo"
  api_key: "${WIKI_API_KEY}"
  batch_limit: 50
  poll_interval: 60s
\`\`\`

## Model Selection

Supported models:

- \`gpt-4-turbo\` — Best quality, highest cost
- \`gpt-3.5-turbo\` — Fast, cost-effective
- \`claude-3-opus\` — Strong reasoning

## Batch Limits

Control how many pages the Curator processes per run:

- \`1\` to \`10\` — Conservative, good for testing
- \`50\` to \`200\` — Recommended for production
- \`1000\`+ — Aggressive, may incur higher API costs

See [Getting Started](getting-started.md) for initial setup.`,

  "deployment.md": `# Deployment Guide

Deploy Build Wiki to production with Docker, Kubernetes, or bare metal.

## Docker

\`\`\`dockerfile
FROM ghcr.io/build/wiki:latest
COPY ./vault /app/vault
EXPOSE 3000
CMD ["serve", "--port", "3000"]
\`\`\`

## Kubernetes

See the Helm chart in \`charts/wiki/\` for a complete K8s deployment
with persistent volumes and ingress configuration.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| \`WIKI_PORT\` | \`3000\` | Server port |
| \`WIKI_HOST\` | \`localhost\` | Bind address |
| \`WIKI_VERBOSE\` | \`false\` | Enable debug logging |
| \`WIKI_THEME\` | \`light\` | UI theme |

For development setup, see [Contributing Guidelines](contributing.md).`,

  "contributing.md": `# Contributing Guidelines

How to contribute to Build Wiki: code style, PR process, and community standards.

## Code of Conduct

Be respectful and inclusive. See our full [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Create a feature branch: \`git checkout -b feat/my-feature\`
3. Make your changes
4. Run tests: \`npm test\`
5. Submit a pull request

## Development Setup

\`\`\`bash
# Clone and install dependencies
git clone https://github.com/build/wiki.git
cd wiki
npm install

# Run the dev server
npm run dev
\`\`\`

For deployment details, see [Deployment Guide](deployment.md).`,
};

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
    // Check for not-found pages
    if (!PAGE_CONTENT[path] && !PAGES.find((p) => p.path === path)) {
      return `# Not Found\n\nPage "${path}" does not exist.`;
    }
    return PAGE_CONTENT[path] || `# ${path}\n\n<!-- page content -->`;
  });
}

export function writePage(_path: string, _content: string): Promise<void> {
  return delay(300).then((): void => {});
}

export function deletePage(_path: string): Promise<void> {
  return delay(200).then((): void => {});
}

export function searchPages(query: string): Promise<SearchResult[]> {
  return delay().then((): SearchResult[] => {
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const page of PAGES) {
      if (
        page.title.toLowerCase().includes(q) ||
        page.path.toLowerCase().includes(q) ||
        (page.snippet && page.snippet.toLowerCase().includes(q))
      ) {
        const idx = page.title.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 30);
        const snippet =
          (page.snippet || page.title).substring(start, start + 80) + "…";
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

/**
 * Compute backlinks by scanning all page content for [[wiki links]] and
 * [markdown links](path).
 */
export function pageBacklinks(targetPath: string): Promise<BacklinkEntry[]> {
  return delay().then((): BacklinkEntry[] => {
    const targetSlug = targetPath.replace(/\.md$/, "").replace(/[^a-z0-9-]/g, "-");
    const backlinks: BacklinkEntry[] = [];

    for (const page of PAGES) {
      if (page.path === targetPath) continue;

      const content = PAGE_CONTENT[page.path] || "";
      const links: string[] = [];

      // Find [[wiki links]]
      const doubleBracketRegex = /\[\[([^\]]+)\]\]/g;
      let match;
      while ((match = doubleBracketRegex.exec(content)) !== null) {
        links.push(match[1]);
      }

      // Find markdown links [text](path)
      const markdownLinkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
      while ((match = markdownLinkRegex.exec(content)) !== null) {
        const linkPath = match[2].replace(/#.*/, "");
        if (
          linkPath.toLowerCase().includes(targetSlug) ||
          linkPath === targetPath ||
          linkPath.includes(targetPath.replace(/\.md$/, ""))
        ) {
          links.push(match[1]);
        }
      }

      if (links.length > 0) {
        backlinks.push({
          sourcePath: page.path,
          sourceTitle: page.title,
          context: links.map((l) => `\`[[${l}]]\``).join(", "),
        });
      }
    }

    return backlinks;
  });
}
