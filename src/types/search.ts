export interface SearchHit {
  source: 'page' | 'asset' | 'chunk';
  id: string;
  title: string;
  snippet: string;
  path: string;
  date: string;
  score: number;
}

export type FilterType = 'all' | 'pages' | 'assets';

export async function searchWiki(query: string, filter: FilterType): Promise<SearchHit[]> {
  await new Promise((r) => setTimeout(r, 600));
  if (!query.trim()) return [];

  const results: SearchHit[] = [
    { source: 'page', id: 'page-001', title: 'Understanding Wiki Architecture', snippet: `The wiki is a persistent, compounding artifact. Instead of re-deriving answers from raw documents (RAG-style), an LLM curator reads new sources once and integrates them into a structured, interlinked Markdown wiki.`, path: 'wiki/concepts/architecture.md', date: '2026-05-15T10:30:00Z', score: 0.95 },
    { source: 'asset', id: 'asset-001', title: 'Design Specifications v2', snippet: `This document outlines the design specifications for the wiki platform. Key topics include the vault model, search indexing with SQLite FTS5, and the Curator agent architecture.`, path: 'assets/docs/design-specs-v2.pdf', date: '2026-05-10T14:22:00Z', score: 0.87 },
    { source: 'page', id: 'page-002', title: 'Curator Agent Configuration', snippet: `The Curator agent runs autonomously, maintaining pages through ingest fan-out, query write-back, and scheduled lint loops. Configure model, API keys, and batch limits in .wiki/config.yaml.`, path: 'wiki/reference/curator-config.md', date: '2026-05-12T09:15:00Z', score: 0.82 },
    { source: 'asset', id: 'asset-002', title: 'Architecture Diagram', snippet: `Hexagonal architecture with ports (traits) and adapters. The application core depends only on traits.`, path: 'assets/docs/architecture-diagram.png', date: '2026-05-08T16:45:00Z', score: 0.78 },
    { source: 'page', id: 'page-003', title: 'Vault Lifecycle Commands', snippet: `The vault is the unit of knowledge. Commands include init, clone, list, use, and forget.`, path: 'wiki/reference/vault-lifecycle.md', date: '2026-05-14T11:00:00Z', score: 0.73 },
    { source: 'chunk', id: 'chunk-001', title: 'Ingest Pipeline Details', snippet: `After AssetService::ingest finishes hashing and uploading, the Curator fan-out reads summaries and top-K chunks to extract entities.`, path: 'wiki/concepts/ingest.md#pipeline', date: '2026-05-13T08:30:00Z', score: 0.68 },
  ];

  if (filter === 'pages') return results.filter((r) => r.source === 'page');
  if (filter === 'assets') return results.filter((r) => r.source === 'asset');
  return results;
}
