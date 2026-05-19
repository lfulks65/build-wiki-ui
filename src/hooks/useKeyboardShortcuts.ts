/**
 * Keyboard shortcuts system for the Wiki application.
 *
 * Provides a registry of named shortcuts with category grouping,
 * a global keydown listener, and integration with the ShortcutsOverlay.
 */

import React from "react";

// ── Types ──────────────────────────────────────────────────────────

export interface Shortcut {
  key: string;
  label: string;
  category: string;
  condition?: string;
}

export interface RegisteredShortcut extends Shortcut {
  handler: (e: KeyboardEvent) => void | boolean;
  /** When true, the handler should preventDefault and stopPropagation */
  preventDefault?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  /** Called when "show shortcuts" key is pressed */
  onShowShortcuts?: () => void;
}

/** Normalised key name for consistent comparison */
function normaliseKey(e: KeyboardEvent): string {
  const base = e.key.toLowerCase();
  if (base === " " || base === "spacebar") return "space";
  if (base === "control" || base === "meta") return base;
  return base;
}

/** Build a display label like "⌘K" or "Ctrl+S" */
function formatKey(e: KeyboardEvent): string {
  const key = e.key.toLowerCase();
  const prefix: string[] = [];

  if (e.metaKey || e.ctrlKey) {
    // Prefer ⌘ on Mac, Ctrl elsewhere
    if (e.metaKey) prefix.push("⌘");
    else prefix.push("Ctrl");
  }
  if (e.shiftKey) prefix.push("⇧");
  if (e.altKey) prefix.push("⌥");

  const displayKey =
    key.length === 1 ? key.toUpperCase() : key.charAt(0).toUpperCase() + key.slice(1);
  return prefix.length > 0 ? prefix.join("+") + "+" + displayKey : displayKey;
}

/** Default shortcuts shipped with the application */
const DEFAULT_SHORTCUTS: Shortcut[] = [
  // Navigation
  { key: "⌘K / Ctrl+K", label: "Command Palette", category: "Navigation" },
  { key: "⌘B / Ctrl+B", label: "Toggle sidebar", category: "Navigation" },
  { key: "g p", label: "Go to Pages", category: "Navigation" },
  { key: "g s", label: "Go to Search", category: "Navigation" },
  // Search
  { key: "/", label: "Focus search input", category: "Search" },
  // Editing
  { key: "⌘S / Ctrl+S", label: "Save page (in editor)", category: "Editing" },
  // Appearance
  { key: "t", label: "Toggle theme", category: "Appearance" },
  // General
  { key: "?", label: "Show shortcuts", category: "Help" },
  { key: "Esc", label: "Close overlay / cancel", category: "General" },
];

// ── Custom Hook ────────────────────────────────────────────────────

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { onShowShortcuts } = options;

  const [shortcuts, setShortcuts] = React.useState<RegisteredShortcut[]>(() => {
    return DEFAULT_SHORTCUTS.map((s) => ({
      ...s,
      handler: () => {},
      preventDefault: true,
    }));
  });

  /** Register a shortcut with a custom handler */
  const registerShortcut = React.useCallback(
    (shortcut: Omit<RegisteredShortcut, "handler"> & { handler?: (e: KeyboardEvent) => void | boolean }) => {
      setShortcuts((prev) => {
        // Remove existing shortcut with the same key+category
        const filtered = prev.filter(
          (p) => !(p.key === shortcut.key && p.category === shortcut.category)
        );
        return [
          ...filtered,
          {
            ...shortcut,
            handler: shortcut.handler || (() => {}),
            preventDefault: shortcut.preventDefault ?? true,
          },
        ];
      });
    },
    [],
  );

  /** Unregister a shortcut by key + category */
  const unregisterShortcut = React.useCallback(
    (key: string, category: string) => {
      setShortcuts((prev) =>
        prev.filter((s) => !(s.key === key && s.category === category))
      );
    },
    [],
  );

  // Expose the registered shortcuts (for the overlay to read)
  const getAllShortcuts = React.useCallback(() => shortcuts, [shortcuts]);

  return {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    getAllShortcuts,
    defaultShortcuts: DEFAULT_SHORTCUTS,
  };
}

export { DEFAULT_SHORTCUTS, formatKey };
