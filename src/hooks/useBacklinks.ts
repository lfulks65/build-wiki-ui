/**
 * useBacklinks — hook that computes and caches backlinks for a given page.
 *
 * Fetches all pages and their content, builds a reverse link index,
 * and returns the backlinks for the target page.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { listPages, readPage } from '@/lib/api';
import {
  buildBacklinkIndex,
  getBacklinksForPage,
  clearBacklinkCache,
  PageWithContent,
  Backlink,
  getCacheVersion,
  clearBacklinkCache as _clearCache,
} from '@/utils/backlinks';

/* ── Types ─────────────────────────────────────────────────────────────── */

export interface BacklinksState {
  /** List of backlinks pointing to the target page. */
  backlinks: Backlink[];
  /** Whether data is currently being fetched/computed. */
  loading: boolean;
  /** Error message, if computation failed. */
  error: string | null;
  /** Force a recomputation and refetch. */
  refresh: () => void;
  /** Total number of backlinks. */
  totalCount: number;
}

/* ── Module-level cache ────────────────────────────────────────────────── */

/**
 * Global cache to avoid recomputing the index across hook instances.
 * Map<path → PageWithContent[]> is used to build the index once.
 */
const globalCache = new Map<string, { pages: PageWithContent[]; index: Map<string, Backlink[]> }>();

/* ── Hook ──────────────────────────────────────────────────────────────── */

/**
 * Compute and return backlinks for a given page slug.
 *
 * On mount, fetches all pages and their content, builds the backlink index,
 * and filters for the target page. Results are cached globally and reused
 * across hook instances. Cache is invalidated when pages change (detected
 * by content hashes).
 *
 * @param pageSlug — The target page slug (e.g., "getting-started").
 * @returns BacklinksState with backlinks, loading, error, and refresh.
 */
export function useBacklinks(pageSlug: string): BacklinksState {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSlugRef = useRef(pageSlug);
  pageSlugRef.current = pageSlug;

  const compute = useCallback(async () => {
    const slug = pageSlugRef.current;
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch all pages
      const pageSummaries = await listPages();

      // Step 2: Check if we have a valid cached index for these pages
      const cacheKey = pageSummaries.map((p) => `${p.path}:${p.modified}`).join('|');
      const cached = globalCache.get(cacheKey);

      let pagesWithContent: PageWithContent[];
      let index: Map<string, Backlink[]>;

      if (cached) {
        pagesWithContent = cached.pages;
        index = cached.index;
      } else {
        // Step 3: Read content for each page
        pagesWithContent = [];
        for (const summary of pageSummaries) {
          try {
            const content = await readPage(summary.path);
            pagesWithContent.push({
              path: summary.path.replace(/\.md$/, '').replace(/\.mdx$/, ''),
              title: summary.title,
              content,
            });
          } catch {
            // Skip pages that fail to read
            pagesWithContent.push({
              path: summary.path.replace(/\.md$/, '').replace(/\.mdx$/, ''),
              title: summary.title,
              content: '',
            });
          }
        }

        // Step 4: Build backlink index
        index = buildBacklinkIndex(pagesWithContent);

        // Step 5: Cache the result
        globalCache.set(cacheKey, { pages: pagesWithContent, index });
      }

      // Step 6: Get backlinks for target page
      const normalizedSlug = slug.replace(/^\/pages\//, '');
      const backlinkList = getBacklinksForPage(normalizedSlug, index);

      setBacklinks(backlinkList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load backlinks');
      setBacklinks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Compute on mount and when pageSlug changes
  useEffect(() => {
    compute();
  }, [compute]);

  // Watch for cache version changes (page updates invalidate cache)
  useEffect(() => {
    let prevVersion = getCacheVersion();
    const interval = setInterval(() => {
      const currentVersion = getCacheVersion();
      if (currentVersion !== prevVersion) {
        // Cache was invalidated — clear global cache and recompute
        globalCache.clear();
        compute();
        prevVersion = currentVersion;
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [compute]);

  const refresh = useCallback(() => {
    globalCache.clear();
    clearBacklinkCache();
    compute();
  }, [compute]);

  return {
    backlinks,
    loading,
    error,
    refresh,
    totalCount: backlinks.length,
  };
}
