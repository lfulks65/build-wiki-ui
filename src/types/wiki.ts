export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  path: string;
  modified: string | Date;
  snippet?: string;
  wordCount?: number;
  lastViewed?: string | Date;
}

export type SortOption = 'name' | 'modified' | 'viewed';
export type SortDirection = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Asset types
// ---------------------------------------------------------------------------

export type AssetType = 'image' | 'pdf' | 'audio' | 'video' | 'markdown' | 'other';
export type AssetStatus = 'queued' | 'processing' | 'complete' | 'failed';
export type ViewMode = 'grid' | 'list';

export interface AssetSummary {
  id: string;
  filename: string;
  type: AssetType;
  status: AssetStatus;
  addedAt?: string;
  thumbnail?: string;
}

export interface AssetChunk {
  id: string;
  text: string;
  index: number;
}

export interface AssetRecord {
  id: string;
  filename: string;
  type: AssetType;
  status: AssetStatus;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  originalFilename: string;
  sourceUrl?: string;
  ingestDate: string;
  modified: string;
  chunks: AssetChunk[];
  metadata: Record<string, unknown>;
  processingLog: ProcessingEvent[];
  tags?: string[];
  thumbnail?: string;
}

export interface ProcessingEvent {
  id: string;
  stage: string;
  status: string;
  timestamp: string;
  details?: string;
}

export interface IngestProgress {
  fileId: string;
  filename: string;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'failed';
  progress: number;
  error?: string;
}

export interface AssetFilter {
  search: string;
  type: AssetType | 'all';
  status: AssetStatus | 'all';
  sortBy: SortOption;
  sortOrder: SortDirection;
}
