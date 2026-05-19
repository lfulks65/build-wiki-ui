import { useCallback, useEffect, useRef, useState } from "react";
import type { CommandPaletteItemData } from "@/components/CommandPaletteItem";

// ── Constants ──────────────────────────────────────────────────────

const STORAGE_KEY = "wiki-command-palette-recent";
const MAX_RECENT = 5;

// ── Helpers ────────────────────────────────────────────────────────

function loadRecent(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(pages: string[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch {
    // sessionStorage may be unavailable
  }
}

function normalizeKey(e: KeyboardEvent): string {
  return e.key.toLowerCase();
}

// ── Hook ───────────────────────────────────────────────────────────

/**
 * Hook managing CommandPalette state: open/close, search, selection,
 * and recently visited pages.
 *
 * Binds ⌘K / Ctrl+K globally to toggle the palette.
 *
 * @returns State and handlers for the command palette.
 */
export function useCommandPalette(): {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  recentPages: string[];
  addToRecent: (path: string) => void;
} {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentPages, setRecentPages] = useState<string[]>(loadRecent);

  // Close on hash/navigation changes
  useEffect(() => {
    const handler = () => setIsOpen(false);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const key = normalizeKey(e);
      if (key !== "k") return;
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        // Reset search & selection when toggling open
        if (!e.metaKey && !e.ctrlKey) {
          // This branch won't fire since we already handled the combo
        }
        if (e.metaKey || e.ctrlKey) {
          setSearchQuery("");
          setSelectedIndex(0);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setSearchQuery("");
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    setSelectedIndex(0);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Add a page to recent list
  const addToRecent = useCallback((path: string) => {
    setRecentPages((prev) => {
      const filtered = prev.filter((p) => p !== path);
      const updated = [path, ...filtered].slice(0, MAX_RECENT);
      saveRecent(updated);
      return updated;
    });
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    searchQuery,
    setSearchQuery,
    selectedIndex,
    setSelectedIndex,
    recentPages,
    addToRecent,
  };
}
