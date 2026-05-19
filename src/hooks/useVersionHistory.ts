/**
 * Version history hook backed by localStorage.
 *
 * Stores page revisions keyed by slug under the localStorage key
 * `wiki-revisions`.  Each page is limited to 20 revisions (oldest
 * pruned on overflow).
 *
 * @module useVersionHistory
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { computeDiff, DiffResult } from "@/utils/diff";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PageRevision {
  /** Unique revision ID (uuid) */
  id: string;
  /** Page slug this revision belongs to */
  pageSlug: string;
  /** Full page content at time of revision */
  content: string;
  /** ISO-8601 timestamp */
  timestamp: string;
  /** Optional edit summary */
  message?: string;
}

/** Raw data shape stored in localStorage: `{ [slug]: PageRevision[] }` */
interface RevisionsStore {
  [slug: string]: PageRevision[];
}

const STORAGE_KEY = "wiki-revisions";
const MAX_REVISIONS_PER_PAGE = 20;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId(): string {
  // Compact uuid v4-ish string using crypto when available
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 9)
  );
}

function loadRevisions(): RevisionsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRevisions(store: RevisionsStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useVersionHistory() {
  const [revisionsStore, setRevisionsStore] = useState<RevisionsStore>(
    () => loadRevisions()
  );

  // Keep localStorage in sync with state
  const storeRef = useRef(revisionsStore);
  useEffect(() => {
    storeRef.current = revisionsStore;
    saveRevisions(revisionsStore);
  }, [revisionsStore]);

  /**
   * Add a revision for a given slug.  Oldest revision is pruned when
   * the count exceeds `MAX_REVISIONS_PER_PAGE`.
   */
  const addRevision = useCallback(
    (slug: string, content: string, message?: string) => {
      setRevisionsStore((prev) => {
        const existing = prev[slug] || [];

        // Avoid duplicate: if the latest revision has the same content, skip
        if (
          existing.length > 0 &&
          existing[existing.length - 1].content === content
        ) {
          // Still update the message if provided
          if (message) {
            const updated = [...existing];
            updated[updated.length - 1].message = message;
            updated[updated.length - 1].timestamp = new Date().toISOString();
            return { ...prev, [slug]: updated };
          }
          return prev;
        }

        const newRevision: PageRevision = {
          id: generateId(),
          pageSlug: slug,
          content,
          timestamp: new Date().toISOString(),
          message,
        };

        const updated = [...existing, newRevision];

        // Prune oldest if over limit
        if (updated.length > MAX_REVISIONS_PER_PAGE) {
          updated.splice(0, updated.length - MAX_REVISIONS_PER_PAGE);
        }

        return { ...prev, [slug]: updated };
      });
    },
    [],
  );

  /** Get all revisions for a slug, newest first. */
  const getRevisions = useCallback(
    (slug: string): PageRevision[] => {
      return (revisionsStore[slug] || []).toReversed();
    },
    [revisionsStore],
  );

  /** Get a single revision by ID (searches all pages). */
  const getRevision = useCallback(
    (revisionId: string): PageRevision | undefined => {
      for (const slug of Object.keys(revisionsStore)) {
        const found = revisionsStore[slug].find(
          (r) => r.id === revisionId,
        );
        if (found) return found;
      }
      return undefined;
    },
    [revisionsStore],
  );

  /**
   * Restore a revision: returns the revision content.
   * The caller (e.g. PageEditor) should replace the page content
   * with the returned string.
   */
  const restoreRevision = useCallback(
    (revisionId: string): PageRevision | undefined => {
      const revision = getRevision(revisionId);
      return revision;
    },
    [getRevision],
  );

  /**
   * Compute a diff between two revisions.
   */
  const diffRevisions = useCallback(
    (revA: string, revB: string): DiffResult => {
      return computeDiff(revA, revB);
    },
    [],
  );

  /** Get the number of revisions for a slug. */
  const getRevisionCount = useCallback(
    (slug: string): number => {
      return revisionsStore[slug]?.length || 0;
    },
    [revisionsStore],
  );

  /** Get the timestamp of the most recent revision for a slug. */
  const getLastSaved = useCallback(
    (slug: string): string | undefined => {
      const slugs = revisionsStore[slug];
      if (!slugs || slugs.length === 0) return undefined;
      // Revisions are stored oldest-first, so last = most recent
      return slugs[slugs.length - 1].timestamp;
    },
    [revisionsStore],
  );

  return {
    addRevision,
    getRevisions,
    getRevision,
    restoreRevision,
    diffRevisions,
    getRevisionCount,
    getLastSaved,
    revisionsStore,
  };
}
