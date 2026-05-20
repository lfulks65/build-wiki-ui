import { useState, useCallback, useEffect, useMemo } from "react";

/* ── Types ─────────────────────────────────────────────────────────── */

export type ThemeMode = "light" | "dark" | "system";
export type FontSize = "sm" | "md" | "lg";
export type EditorMode = "split" | "preview" | "source";

/** Predefined API key configuration types. */
export const API_KEY_TYPES = [
  "OPENROUTER_API_KEY",
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
] as const;

export type ApiKeyType = (typeof API_KEY_TYPES)[number];

/** Whether an API key type is required. */
export const REQUIRED_API_KEYS: Record<ApiKeyType, boolean> = {
  OPENROUTER_API_KEY: false,
  GROQ_API_KEY: false,
  GEMINI_API_KEY: false,
  AWS_ACCESS_KEY_ID: true,
  AWS_SECRET_ACCESS_KEY: true,
};

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
const CONFIG_KEY = "wiki-config";

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

/* ── Config helpers (API keys, etc.) ───────────────────────────────── */

/** Load the persisted config section (API keys, etc.). */
function loadConfig(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

/** Save the persisted config section. */
function saveConfig(config: Record<string, string>): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
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
  const [config, setConfig] = useState<Record<string, string>>(loadConfig);

  // Persist settings whenever any setting changes
  useEffect(() => {
    saveToStorage(settings);
  }, [settings]);

  // Persist config whenever it changes
  useEffect(() => {
    saveConfig(config);
  }, [config]);

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

  // ── Config helpers ────────────────────────────────────────────────

  /**
   * Set a configuration value (e.g. an API key).
   * @param key — Configuration key name.
   * @param value — Value to store.
   */
  const setConfig = useCallback((key: string, value: string) => {
    setConfigInternal((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Get a configuration value.
   * @param key — Configuration key name.
   * @returns The stored value, or empty string if not set.
   */
  const getConfig = useCallback((key: string): string => {
    return config[key] ?? "";
  }, [config]);

  /**
   * Delete a configuration value.
   * @param key — Configuration key name.
   */
  const deleteConfig = useCallback((key: string) => {
    setConfigInternal((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /**
   * Clear all configuration (API keys, etc.).
   */
  const clearConfig = useCallback(() => {
    setConfigInternal({});
  }, []);

  const setConfigInternal = useCallback((updater: (prev: Record<string, string>) => Record<string, string>) => {
    setConfig((prev) => updater(prev));
  }, []);

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
    // Config helpers
    setConfig,
    getConfig,
    deleteConfig,
    clearConfig,
  };
}

export { DEFAULTS };
