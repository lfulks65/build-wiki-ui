/**
 * src/hooks/useVersionHistory.ts
 *
 * localStorage-backed version history hook.
 * Stores revisions keyed by page slug under the `wiki-revisions` localStorage key.
 * Auto-prunes to a maximum of 20 revisions per page.
 * Deduplicates: skips saving if content matches the most recent revision.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { computeDiff, DiffResult } from '@/utils/diff';

/* ── Types ─────────────────────────────────────────────────────────────── */

export interface PageRevision {
  id: string;
  pageSlug: string;
  content: string;
  timestamp: string; // ISO-8601
  message?: string;
}

/**
 * Shape of the JSON stored in localStorage.
 * Key = page slug, Value = array of PageRevision (newest first).
 */
type RevisionsStore = Record<string, PageRevision[]>;

const STORAGE_KEY = 'wiki-revisions';
const MAX_REVISIONS = 20;

/* ── Helpers ───────────────────────────────────────────────────────────── */

/** Generate a simple unique ID (no external dependency). */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): RevisionsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as RevisionsStore;
  } catch {
    return {};
  }
}

function saveToStorage(store: RevisionsStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage may be unavailable (private browsing, quota)
  }
}

/* ── Hook ──────────────────────────────────────────────────────────────── */

/**
 * Provides a full version-history API backed by localStorage.
 *
 * - `addRevision(slug, content, message?)` — saves a new revision, pruning to MAX_REVISIONS.
 * - `getRevisions(slug)` — returns revisions sorted newest first.
 * - `getRevision(revisionId)` — finds a single revision by ID.
 * - `restoreRevision(revisionId)` — returns the revision's content (caller applies it).
 * - `diffRevisions(revAid, revBid)` — compares two revisions using computeDiff.
 * - `getRevisionCount(slug)` — number of revisions for a slug.
 * - `getLastSaved(slug)` — timestamp of the most recent revision.
 */
export function useVersionHistory() {
  const [revisions, setRevisions] = useState<RevisionsStore>(loadFromStorage);

  // Persist whenever revisions change
  useEffect(() => {
    saveToStorage(revisions);
  }, [revisions]);

  /* ── Add revision ─────────────────────────────────────────────────────── */

  const addRevision = useCallback(
    (slug: string, content: string, message?: string): string | null => {
      // Deduplicate: skip if content matches the most recent revision
      const existing = revisions[slug] ?? [];
      if (existing.length > 0 && existing[0].content === content) {
        return null;
      }

      const newRevision: PageRevision = {
        id: generateId(),
        pageSlug: slug,
        content,
        timestamp: new Date().toISOString(),
        message,
      };

      setRevisions((prev) => {
        const arr = [newRevision, ...(prev[slug] ?? [])];
        // Prune to MAX_REVISIONS
        if (arr.length > MAX_REVISIONS) {
          arr.length = MAX_REVISIONS;
        }
        return { ...prev, [slug]: arr };
      });

      return newRevision.id;
    },
    [revisions],
  );

  /* ── Get revisions ────────────────────────────────────────────────────── */

  const getRevisions = useCallback(
    (slug: string): PageRevision[] => {
      return revisions[slug] ?? [];
    },
    [revisions],
  );

  /* ── Get single revision ──────────────────────────────────────────────── */

  const getRevision = useCallback(
    (revisionId: string): PageRevision | undefined => {
      for (const slugRevisions of Object.values(revisions)) {
        const found = slugRevisions.find((r) => r.id === revisionId);
        if (found) return found;
      }
      return undefined;
    },
    [revisions],
  );

  /* ── Restore revision ─────────────────────────────────────────────────── */

  const restoreRevision = useCallback(
    (revisionId: string): string | undefined => {
      const rev = getRevision(revisionId);
      return rev?.content;
    },
    [getRevision],
  );

  /* ── Diff two revisions ───────────────────────────────────────────────── */

  const diffRevisions = useCallback(
    (revisionIdA: string, revisionIdB: string): DiffResult | undefined => {
      const revA = getRevision(revisionIdA);
      const revB = getRevision(revisionIdB);
      if (!revA || !revB) return undefined;
      return computeDiff(revA.content, revB.content);
    },
    [getRevision],
  );

  /* ── Count ────────────────────────────────────────────────────────────── */

  const getRevisionCount = useCallback(
    (slug: string): number => {
      return (revisions[slug] ?? []).length;
    },
    [revisions],
  );

  /* ── Last saved ───────────────────────────────────────────────────────── */

  const getLastSaved = useCallback(
    (slug: string): string | undefined => {
      const arr = revisions[slug] ?? [];
      return arr.length > 0 ? arr[0].timestamp : undefined;
    },
    [revisions],
  );

  return {
    addRevision,
    getRevisions,
    getRevision,
    restoreRevision,
    diffRevisions,
    getRevisionCount,
    getLastSaved,
  };
}
