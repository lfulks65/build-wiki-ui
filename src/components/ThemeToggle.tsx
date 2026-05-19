import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

/* ── Icon map keyed by resolved theme ─────────────────────────────── */
const iconByMode: Record<string, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const labelByMode: Record<string, string> = {
  light: "Switch to dark mode",
  dark: "Switch to system theme",
  system: "Switch to light mode",
};

export function ThemeToggle(): React.ReactElement {
  const { theme, isDark, toggleTheme } = useTheme();

  /* The resolved theme drives which icon to show */
  const resolved = isDark ? "dark" : "light";
  const Icon = iconByMode[resolved];
  const ariaLabel = labelByMode[resolved];

  return (
    <button
      onClick={toggleTheme}
      className="group flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:focus-visible:ring-offset-gray-950"
      aria-label={ariaLabel}
      title={`Current: ${theme} mode`}
    >
      <span className="inline-block transition-transform duration-200 ease-in-out group-hover:rotate-12">
        <Icon size={20} />
      </span>
    </button>
  );
}
