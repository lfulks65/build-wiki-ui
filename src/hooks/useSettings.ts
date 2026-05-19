import { useState, useCallback, useEffect, useMemo } from "react";

/* ── Types ─────────────────────────────────────────────────────────── */

export type ThemeMode = "light" | "dark" | "system";
export type FontSize = "sm" | "md" | "lg";
export type EditorMode = "split" | "preview" | "source";

export interface UserSettings {
  theme: ThemeMode;
  fontSize: FontSize;
  reducedMotion: boolean;
  editorMode: EditorMode;
  autoSave: boolean;
  tabSize: 2 | 4;
  showToc: boolean;
  showBreadcrumbs: boolean;
}

const STORAGE_KEY = "wiki-settings";

const DEFAULTS: UserSettings = {
  theme: "system",
  fontSize: "md",
  reducedMotion: false,
  editorMode: "split",
  autoSave: true,
  tabSize: 2,
  showToc: true,
  showBreadcrumbs: true,
};

/* ── Helpers ───────────────────────────────────────────────────────── */

function loadFromStorage(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveToStorage(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may be unavailable (private browsing, quota)
  }
}

/* ── Hook ──────────────────────────────────────────────────────────── */

/**
 * Manages user preferences via localStorage (`wiki-settings`).
 *
 * Every setting can be read and mutated individually.  The full
 * `settings` object is always available as a memoized value so that
 * consumers don't re-render on every getter call — only when the
 * underlying settings change.
 */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(loadFromStorage);

  // Persist whenever any setting changes
  useEffect(() => {
    saveToStorage(settings);
  }, [settings]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setFontSize = useCallback((fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setSettings((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);

  const setEditorMode = useCallback((editorMode: EditorMode) => {
    setSettings((prev) => ({ ...prev, editorMode }));
  }, []);

  const toggleAutoSave = useCallback(() => {
    setSettings((prev) => ({ ...prev, autoSave: !prev.autoSave }));
  }, []);

  const setTabSize = useCallback((tabSize: 2 | 4) => {
    setSettings((prev) => ({ ...prev, tabSize }));
  }, []);

  const toggleShowToc = useCallback(() => {
    setSettings((prev) => ({ ...prev, showToc: !prev.showToc }));
  }, []);

  const toggleShowBreadcrumbs = useCallback(() => {
    setSettings((prev) => ({ ...prev, showBreadcrumbs: !prev.showBreadcrumbs }));
  }, []);

  const resetAll = useCallback(() => {
    setSettings({ ...DEFAULTS });
  }, []);

  const value = useMemo<UserSettings>(() => settings, [settings]);

  return {
    settings: value,
    setTheme,
    setFontSize,
    toggleReducedMotion,
    setEditorMode,
    toggleAutoSave,
    setTabSize,
    toggleShowToc,
    toggleShowBreadcrumbs,
    resetAll,
  };
}

export { DEFAULTS };
