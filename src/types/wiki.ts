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
