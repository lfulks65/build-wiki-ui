import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────────────

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextValue {
  /** The raw theme mode selection: 'light', 'dark', or 'system' */
  theme: ThemeMode;
  /** Resolved computed theme for CSS class application */
  resolvedTheme: "light" | "dark";
  /** Whether the resolved theme is dark */
  isDark: boolean;
  /** Cycle theme: light → dark → system */
  toggleTheme: () => void;
  /** Set theme to a specific mode */
  setTheme: (mode: ThemeMode) => void;
}

// ── Helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = "wiki-theme";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark"): void {
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function loadStoredTheme(): ThemeMode {
  try {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? "system";
  } catch {
    return "system";
  }
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  return mode === "system" ? getSystemTheme() : mode;
}

// ── Context ────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = useState<ThemeMode>(loadStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    () => resolveTheme(loadStoredTheme()),
  );
  const [isDark, setIsDark] = useState(
    () => resolveTheme(loadStoredTheme()) === "dark",
  );

  // Listen for system preference changes when in system mode
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = resolveTheme(theme);
      setResolvedTheme(resolved);
      setIsDark(resolved === "dark");
      applyTheme(resolved);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  // Apply theme to DOM whenever resolvedTheme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Persist to localStorage when explicit theme is set
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage may be unavailable
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next: Record<ThemeMode, ThemeMode> = {
        light: "dark",
        dark: "system",
        system: "light",
      };
      return next[prev];
    });
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      isDark,
      toggleTheme,
      setTheme,
    }),
    [theme, resolvedTheme, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
