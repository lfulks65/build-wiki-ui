import React, { useMemo } from 'react';

export interface CommandPaletteItemProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  shortcut?: string;
  active?: boolean;
  onClick?: () => void;
  /** Optional query string for matching character highlighting */
  query?: string;
}

/**
 * Renders a single command palette item.
 * When `query` is provided, matching characters in the title are highlighted with <mark>.
 */
export default function CommandPaletteItem({
  icon: Icon,
  title,
  subtitle,
  shortcut,
  active = false,
  onClick,
  query = '',
}: CommandPaletteItemProps) {
  const highlightedTitle = useMemo(() => {
    if (!query) return title;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return title.replace(regex, '<mark>$1</mark>');
  }, [title, query]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors rounded-lg group ${
        active
          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
      aria-selected={active}
      role="option"
    >
      {/* Icon */}
      <span
        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
          active
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>

      {/* Title + subtitle */}
      <span className="flex-1 min-w-0">
        <span
          className="text-sm font-medium block leading-tight"
          dangerouslySetInnerHTML={{ __html: highlightedTitle }}
        />
        {subtitle && (
          <span className="text-xs text-gray-400 dark:text-gray-500 block leading-tight truncate">
            {subtitle}
          </span>
        )}
      </span>

      {/* Keyboard shortcut hint */}
      {shortcut && (
        <kbd className="shrink-0 hidden sm:flex items-center gap-0.5 text-[11px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
