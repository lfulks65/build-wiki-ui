/**
 * KeyboardShortcutsProvider — Global context for keyboard shortcuts.
 *
 * Provides:
 * - Register/unregister shortcuts at runtime
 * - Global keydown listener with input-element awareness
 * - Overlay visibility toggle on "?"
 * - Shortcut handler override (preventDefault / stopPropagation)
 *
 * Usage:
 *   <KeyboardShortcutsProvider>
 *     <App />
 *   </KeyboardShortcutsProvider>
 *
 * Inside components:
 *   const { registerShortcut, shortcuts, overlayOpen, setOverlayOpen } = useKeyboardShortcuts();
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ShortcutsOverlay } from "@/components/ShortcutsOverlay";
import {
  useKeyboardShortcuts,
  type Shortcut,
  type RegisteredShortcut,
  type UseKeyboardShortcutsOptions,
} from "@/hooks/useKeyboardShortcuts";

// ── Context ─────────────────────────────────────────────────────────

export interface KeyboardShortcutsContextValue {
  /** Current overlay visibility */
  overlayOpen: boolean;
  /** Toggle overlay visibility */
  setOverlayOpen: (open: boolean) => void;
  /** All registered shortcuts (includes custom + default) */
  shortcuts: Shortcut[];
  /** Register a new shortcut with a handler */
  registerShortcut: (
    shortcut: Omit<RegisteredShortcut, "handler"> & {
      handler?: (e: KeyboardEvent) => void | boolean;
    },
  ) => void;
  /** Unregister a shortcut by key + category */
  unregisterShortcut: (key: string, category: string) => void;
  /** Get all shortcuts (for the overlay) */
  getAllShortcuts: () => Shortcut[];
}

const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextValue | null
>(null);

export function useKeyboardShortcuts(): KeyboardShortcutsContextValue {
  const ctx = useContext(KeyboardShortcutsContext);
  if (!ctx) {
    throw new Error(
      "useKeyboardShortcuts must be used within a KeyboardShortcutsProvider",
    );
  }
  return ctx;
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Check if the active element is an interactive input element */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;

  // Ignore shortcuts when the user is typing in an input
  if (tag === "button") return false;

  return false;
}

// ── Provider ────────────────────────────────────────────────────────

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
  /** Callback when "?" shortcut is triggered */
  onShowShortcuts?: () => void;
}

export function KeyboardShortcutsProvider({
  children,
  onShowShortcuts,
}: KeyboardShortcutsProviderProps): React.ReactElement {
  const {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    getAllShortcuts,
  } = useKeyboardShortcuts({ onShowShortcuts });

  const [overlayOpen, setOverlayOpen] = useState(false);

  // ── Register "?" shortcut to open overlay ────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only fire on single-key shortcut (not modifier+key)
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "?" && e.key !== "/") return;

      e.preventDefault();
      setOverlayOpen(true);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Register overlay close on Escape ─────────────────────────────
  useEffect(() => {
    if (!overlayOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOverlayOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [overlayOpen]);

  // ── Global keydown listener for all registered shortcuts ─────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never fire shortcuts when the user is typing in an input
      if (isInputElement(e.target)) return;

      for (const shortcut of shortcuts) {
        if (typeof shortcut.handler !== "function") continue;
        const result = shortcut.handler(e);
        if (result === true && shortcut.preventDefault) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  // ── Provide "show shortcuts" action ──────────────────────────────
  const showShortcuts = useCallback(() => {
    setOverlayOpen(true);
    onShowShortcuts?.();
  }, [onShowShortcuts]);

  const value = useMemo<KeyboardShortcutsContextValue>(
    () => ({
      overlayOpen,
      setOverlayOpen,
      shortcuts: getAllShortcuts(),
      registerShortcut,
      unregisterShortcut,
      getAllShortcuts,
    }),
    [
      overlayOpen,
      shortcuts,
      registerShortcut,
      unregisterShortcut,
      getAllShortcuts,
    ],
  );

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      <ShortcutsOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        shortcuts={getAllShortcuts()}
      />
    </KeyboardShortcutsContext.Provider>
  );
}
