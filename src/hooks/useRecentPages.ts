import { useState, useCallback } from 'react';
import {
  loadRecentPages,
  saveRecentPages,
  addPageToRecent,
  clearRecentPages,
  type RecentPage,
  type RecentPagesResult,
} from '../lib/recentPages';

export function useRecentPages(maxItems: number = 3): RecentPagesResult {
  const [pages, setPages] = useState<RecentPage[]>(() => loadRecentPages());

  const addPage = useCallback(
    (page: Omit<RecentPage, 'visitedAt'>) => {
      setPages((prev) => {
        const next = addPageToRecent(prev.slice(0, maxItems), page);
        saveRecentPages(next);
        return next;
      });
    },
    [maxItems],
  );

  const clear = useCallback(() => {
    setPages([]);
    clearRecentPages();
  }, []);

  return { pages, addPage, clear };
}
