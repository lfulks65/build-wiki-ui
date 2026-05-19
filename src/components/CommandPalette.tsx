import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  FileText,
  LayoutDashboard,
  Settings,
  Plus,
  PanelLeftOpen,
} from 'lucide-react';
import CommandPaletteItem from '@/components/CommandPaletteItem';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { usePages } from '@/hooks/useApiQuery';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandItem {
  id: string;
  section: 'navigation' | 'pages' | 'actions';
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  shortcut?: string;
  onSelect: () => void;
}

/**
 * Format a date string into a compact relative time label (e.g. "2h").
 * Pure-function replacement for useRelativeTime — must be pure for useMemo.
 */
function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  let diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return '';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 60) return diffMin === 1 ? '1m' : `${diffMin}m`;
  if (diffHr < 24) return diffHr === 1 ? '1h' : `${diffHr}h`;
  return diffDay === 1 ? '1d' : `${diffDay}d`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: pages } = usePages();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build the full command list
  const items = useMemo<CommandItem[]>(() => {
    const navigationItems: CommandItem[] = [
      {
        id: 'nav-pages',
        section: 'navigation',
        icon: FileText,
        title: 'Go to Pages',
        subtitle: '/pages',
        onSelect: () => (window.location.href = '/pages'),
      },
      {
        id: 'nav-assets',
        section: 'navigation',
        icon: LayoutDashboard,
        title: 'Go to Assets',
        subtitle: '/assets',
        onSelect: () => (window.location.href = '/assets'),
      },
      {
        id: 'nav-search',
        section: 'navigation',
        icon: Search,
        title: 'Go to Search',
        subtitle: '/search',
        onSelect: () => (window.location.href = '/search'),
      },
      {
        id: 'nav-curator',
        section: 'navigation',
        icon: LayoutDashboard,
        title: 'Go to Curator',
        subtitle: '/curator',
        onSelect: () => (window.location.href = '/curator'),
      },
      {
        id: 'nav-settings',
        section: 'navigation',
        icon: Settings,
        title: 'Go to Settings',
        subtitle: '/settings',
        onSelect: () => (window.location.href = '/settings'),
      },
    ];

    // Dynamic page items from the API
    const pageItems: CommandItem[] = (pages ?? []).map((page) => ({
      id: `page-${page.path}`,
      section: 'pages',
      icon: FileText,
      title: page.title,
      subtitle: page.path,
      shortcut: formatRelativeTime(page.modified),
      onSelect: () => {
        const slug = page.path.replace(/\.md$/, '').replace(/\//g, '-');
        window.location.href = `/pages/${slug}`;
      },
    }));

    // Actions
    const actionItems: CommandItem[] = [
      {
        id: 'action-new-page',
        section: 'actions',
        icon: Plus,
        title: 'New Page',
        subtitle: '/pages/new',
        shortcut: 'N',
        onSelect: () => (window.location.href = '/pages/new'),
      },
      {
        id: 'action-toggle-theme',
        section: 'actions',
        icon: Plus,
        title: 'Toggle Theme',
        subtitle: 'Switch between light/dark/system',
        onSelect: toggleTheme,
      },
      {
        id: 'action-toggle-sidebar',
        section: 'actions',
        icon: PanelLeftOpen,
        title: 'Toggle Sidebar',
        subtitle: 'Collapse or expand the sidebar',
        shortcut: '⇧ S',
        onSelect: () => {
          const sidebar = document.querySelector('aside');
          if (sidebar) {
            sidebar.classList.toggle('w-0');
            sidebar.classList.toggle('w-56');
          }
        },
      },
    ];

    return [...navigationItems, ...pageItems, ...actionItems];
  }, [pages]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [items, query]);

  // Group by section for display
  const groups = useMemo(() => {
    const result: Record<string, CommandItem[]> = {};
    for (const item of filteredItems) {
      if (!result[item.section]) result[item.section] = [];
      result[item.section].push(item);
    }
    const ordered: Record<string, CommandItem[]> = {};
    for (const section of ['navigation', 'pages', 'actions'] as const) {
      if (result[section]) ordered[section] = result[section];
    }
    return ordered;
  }, [filteredItems]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => filteredItems, [filteredItems]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus the search input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll the selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement | null;
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          flatItems[selectedIndex].onSelect();
          close();
        }
      }
    },
    [flatItems, selectedIndex, close]
  );

  // Toggle theme helper
  function toggleTheme() {
    const html = document.documentElement;
    const current = html.classList.contains('dark') ? 'dark' : 'light';
    if (current === 'light') {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  // Don't render anything when closed
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            className="flex-1 py-4 text-lg bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto py-2"
          role="listbox"
        >
          {Object.entries(groups).length === 0 ? (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(groups).map(([section, groupItems]) => {
              const sectionLabel =
                section === 'navigation'
                  ? 'Navigation'
                  : section === 'pages'
                  ? 'Pages'
                  : 'Actions';

              return (
                <div key={section} className="mb-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {sectionLabel}
                  </div>
                  {groupItems.map((item) => {
                    const globalIdx = flatItems.findIndex((f) => f.id === item.id);
                    return (
                      <CommandPaletteItem
                        key={item.id}
                        icon={item.icon}
                        title={item.title}
                        subtitle={item.subtitle}
                        shortcut={item.shortcut}
                        active={globalIdx === selectedIndex}
                        onClick={() => {
                          item.onSelect();
                          close();
                        }}
                        query={query}
                      />
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">↑↓</span>{' '}
            navigate
          </span>
          <span className="flex items-center gap-1">
            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">↵</span>{' '}
            select
          </span>
          <span className="flex items-center gap-1">
            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">esc</span>{' '}
            close
          </span>
          <span className="flex-1" />
          <span className="flex items-center gap-1">
            ⌨️ Build Wiki
          </span>
        </div>
      </div>
    </div>
  );
}
