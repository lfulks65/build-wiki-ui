import { useState, useCallback, useEffect } from "react";

/* ── Types ─────────────────────────────────────────────────────────── */

export interface Favorite {
  slug: string;
  title: string;
  addedAt: string; // ISO-8601 timestamp
}

const STORAGE_KEY = "wiki-favorites";
const MAX_FAVORITES = 50;

/** Shape of the JSON stored in localStorage — same as Favorite[]. */
type FavoritesArray = Favorite[];

/* ── Helpers ───────────────────────────────────────────────────────── */

function loadFromStorage(): FavoritesArray {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FavoritesArray;
  } catch {
    return [];
  }
}

function saveToStorage(items: FavoritesArray): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ── Hook ──────────────────────────────────────────────────────────── */

/**
 * Manages favorites (bookmarks) via localStorage.
 *
 * - Stores up to MAX_FAVORITES entries in `wiki-favorites` key.
 * - When adding would exceed the limit, the oldest item is pruned.
 * - Items are sorted by most recently added (descending `addedAt`).
 * - Persists across page reloads.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(loadFromStorage);

  // Keep localStorage in sync whenever favorites change
  useEffect(() => {
    saveToStorage(favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (slug: string): boolean => {
      return favorites.some((f) => f.slug === slug);
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    (slug: string, title: string) => {
      setFavorites((prev) => {
        const idx = prev.findIndex((f) => f.slug === slug);

        if (idx !== -1) {
          // Already favorited — remove it
          return prev.filter((_, i) => i !== idx);
        }

        // Not favorited — add it, pruning oldest if at capacity
        const newItem: Favorite = { slug, title, addedAt: new Date().toISOString() };
        let next = [newItem, ...prev];
        if (next.length > MAX_FAVORITES) {
          // Sort by oldest first so we can drop the last (oldest) item
          next.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
          next = next.slice(1);
        }
        return next;
      });
    },
    [],
  );

  const removeFavorite = useCallback((slug: string) => {
    setFavorites((prev) => prev.filter((f) => f.slug !== slug));
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
