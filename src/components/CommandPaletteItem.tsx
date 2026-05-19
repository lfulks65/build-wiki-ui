import React from "react";
import {
  FileText,
  Search,
  Folder,
  Tag,
  Star,
  Settings,
  Plus,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

export interface CommandPaletteItemData {
  id: string;
  title: string;
  subtitle?: string;
  icon: "FileText" | "Search" | "Folder" | "Tag" | "Star" | "Settings" | "Plus";
  shortcut?: string;
  category?: string;
}

export interface CommandPaletteItemProps {
  data: CommandPaletteItemData;
  isSelected: boolean;
  searchQuery: string;
  onSelect: (data: CommandPaletteItemData) => void;
}

// ── Icon map ───────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Search,
  Folder,
  Tag,
  Star,
  Settings,
  Plus,
};

// ── Highlight helper ───────────────────────────────────────────────

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold text-indigo-400">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}

// ── Component ──────────────────────────────────────────────────────

/**
 * Individual result item inside the CommandPalette.
 *
 * Displays an icon, highlighted title, optional subtitle, and a
 * keyboard shortcut badge.  Supports selected and hover states.
 */
export function CommandPaletteItem({
  data,
  isSelected,
  searchQuery,
  onSelect,
}: CommandPaletteItemProps): React.ReactElement {
  const Icon = ICON_MAP[data.icon] ?? FileText;

  return (
    <button
      onClick={() => onSelect(data)}
      aria-selected={isSelected}
      role="option"
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-100 ${
        isSelected
          ? "bg-indigo-50 dark:bg-indigo-900/20"
          : "hover:bg-gray-100 dark:hover:bg-gray-800/60"
      }`}
    >
      {/* Icon */}
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
          isSelected
            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>

      {/* Title with highlight */}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {highlightMatch(data.title, searchQuery)}
        </span>
        {data.subtitle && (
          <span className="block truncate text-xs text-gray-400 dark:text-gray-500">
            {data.subtitle}
          </span>
        )}
      </span>

      {/* Shortcut badge */}
      {data.shortcut && (
        <span className="shrink-0 rounded-md bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {data.shortcut}
        </span>
      )}
    </button>
  );
}
