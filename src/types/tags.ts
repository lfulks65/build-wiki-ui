export interface TagInfo {
  name: string;
  slug: string;       // url-safe version
  count: number;      // number of pages with this tag
  color?: string;     // optional hex color
}

export interface PageTags {
  pageSlug: string;
  pageTitle: string;
  tags: string[];     // raw tag names from frontmatter
}
