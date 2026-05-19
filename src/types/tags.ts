/**
 * Tag-related types for the wiki tag system.
 */

export interface Tag {
  name: string;
  count: number;
}

export interface TagWithSlug extends Tag {
  slug: string;
}

/**
 * Extend WikiPage to include optional tags.
 */
export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  path: string;
  modified: string | Date;
  snippet?: string;
  wordCount?: number;
  lastViewed?: string | Date;
  tags?: string[];
}
