/**
 * ShortcutsOverlay — A GitHub/Discord-style keyboard shortcuts modal.
 *
 * Features:
 * - Centered modal with backdrop blur
 * - Categorized shortcuts in a grid
 * - Focus trap, proper ARIA attributes
 * - Smooth fade-in/scale animation
 * - Click backdrop or press Esc to close
 * - Fully keyboard-navigable
 */

import React, { useEffect, useRef, useCallback } from "react";
import { X, Keyboard } from "lucide-react";
import type { Shortcut } from "@/hooks/useKeyboardShortcuts";

/* ── Props ────────────────────────────────────────────────────────── */

interface ShortcutsOverlayProps {
  open: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Group shortcuts by category, sorted alphabetically within each */
function groupByCategory(shortcuts: Shortcut[]): Map<string, Shortcut[]> {
  const groups = new Map<string, Shortcut[]>();
  for (const s of shortcuts) {
    const list = groups.get(s.category) ?? [];
    list.push(s);
    groups.set(s.category, list);
  }
  return groups;
}

/* ── Component ────────────────────────────────────────────────────── */

export function ShortcutsOverlay({
  open,
  onClose,
  shortcuts,
}: ShortcutsOverlayProps): React.ReactElement | null {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ── Keyboard handling ────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes overlay
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      // Arrow-down / Arrow-up to navigate between shortcut rows
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const allButtons = Array.from(
          overlayRef.current?.querySelectorAll<HTMLButtonElement>(
            "[data-shortcut-row]"
          ) ?? []
        );
        const current = document.activeElement as HTMLElement | null;
        const currentIndex = allButtons.indexOf(current!);
        let nextIndex: number;

        if (e.key === "ArrowDown") {
          nextIndex = Math.min(currentIndex + 1, allButtons.length - 1);
        } else {
          nextIndex = Math.max(currentIndex - 1, 0);
        }

        allButtons[nextIndex]?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  // ── Focus management ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    // Focus the first button in the overlay when it opens
    const timer = requestAnimationFrame(() => {
      firstFocusableRef.current?.focus();
    });

    // Focus trap: prevent focus from leaving the overlay
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !overlayRef.current) return;

      const focusable = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleTab);

    return () => {
      cancelAnimationFrame(timer);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleTab);
    };
  }, [open]);

  if (!open) return null;

  const grouped = groupByCategory(shortcuts);
  const categoryOrder = ["Navigation", "Search", "Editing", "Appearance", "General", "Help"];

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl animate-in rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        style={{
          animation: "scaleIn 200ms ease-out, fadeUp 200ms ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2
              id="shortcuts-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            ref={firstFocusableRef}
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close shortcuts panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {categoryOrder.map((category) => {
            const items = grouped.get(category);
            if (!items || items.length === 0) return null;

            return (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {category}
                </h3>
                <div className="space-y-1">
                  {items.map((shortcut) => (
                    <ShortcutRow key={`${shortcut.category}-${shortcut.key}`} shortcut={shortcut} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
          <span>Press <kbd className="font-mono">Esc</kbd> to close</span>
          <span>Use arrow keys to navigate</span>
        </div>
      </div>

      {/* CSS animation keyframes (injected once) */}
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); }
          to   { transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Individual Shortcut Row ──────────────────────────────────────── */

function ShortcutRow({ shortcut }: { shortcut: Shortcut }): React.ReactElement {
  return (
    <div
      data-shortcut-row
      role="row"
      className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
    >
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {shortcut.label}
        {shortcut.condition && (
          <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">
            ({shortcut.condition})
          </span>
        )}
      </span>
      <kbd
        className="ml-4 inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs font-semibold leading-none text-gray-600 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        style={{ minWidth: "2.5em", justifyContent: "center" }}
      >
        {shortcut.key}
      </kbd>
    </div>
  );
}
