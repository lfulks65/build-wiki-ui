import { useRef, useEffect, useMemo, useCallback, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePages } from "@/hooks/useApiQuery";
import { CommandPaletteItem } from "@/components/CommandPaletteItem";
import type { CommandPaletteItemData } from "@/components/CommandPaletteItem";

// ── Categories ─────────────────────────────────────────────────────

type CategoryId = "navigation" | "pages" | "actions";

const CATEGORY_LABELS: Record<CategoryId, string> = {
  navigation: "Navigation",
  pages: "Pages",
  actions: "Actions",
};

// ── Static items ───────────────────────────────────────────────────

const STATIC_NAV_ITEMS: Omit<CommandPaletteItemData, "id">[] = [
  { title: "Pages", icon: "FileText", shortcut: "g p" },
  { title: "Search", icon: "Search", shortcut: "g s" },
  { title: "Assets", icon: "Folder" },
  { title: "Tags", icon: "Tag" },
  { title: "Favorites", icon: "Star", shortcut: "g f" },
  { title: "Curator", icon: "Settings" },
  { title: "Settings", icon: "Settings" },
];

const STATIC_ACTION_ITEMS: Omit<CommandPaletteItemData, "id">[] = [
  { title: "New Page", icon: "Plus", shortcut: "⌘N" },
  { title: "Toggle Theme", icon: "Settings" },
];

// ── Utility ────────────────────────────────────────────────────────

/** Generate a unique id for a static item */
function staticItemId(category: CategoryId, title: string): string {
  return `static:${category}:${title}`;
}

/** Generate a unique id for a dynamic page item */
function pageItemId(pagePath: string): string {
  return `page:${pagePath}`;
}

// ── Hook: build command items ──────────────────────────────────────

function useCommandItems(): CommandPaletteItemData[][] {
  const { data: pages, isLoading: pagesLoading } = usePages();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Build pages items (dynamic — depends on API data)
  const pagesItems = useMemo<CommandPaletteItemData[]>(() => {
    if (!pages || pagesLoading) return [];
    return pages.map((p) => ({
      id: pageItemId(p.path),
      title: p.title,
      subtitle: p.path,
      icon: "FileText",
    }));
  }, [pages, pagesLoading]);

  // Build navigation items (static)
  const navItems = useMemo<CommandPaletteItemData[]>(() => {
    return STATIC_NAV_ITEMS.map((item) => ({
      ...item,
      id: staticItemId("navigation", item.title),
    }));
  }, []);

  // Build actions items (static)
  const actionItems = useMemo<CommandPaletteItemData[]>(() => {
    return STATIC_ACTION_ITEMS.map((item) => ({
      ...item,
      id: staticItemId("actions", item.title),
    }));
  }, []);

  // Filter items by query
  const filterItems = useCallback(
    (items: CommandPaletteItemData[], query: string): CommandPaletteItemData[] => {
      if (!query.trim()) return items;
      const lower = query.toLowerCase();
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          (item.subtitle ?? "").toLowerCase().includes(lower),
      );
    },
    [],
  );

  // Categorised, filtered results
  const categories = useMemo(() => {
    const query = ""; // caller controls filtering
    return [
      {
        label: CATEGORY_LABELS.navigation,
        items: navItems,
      },
      {
        label: CATEGORY_LABELS.pages,
        items: pagesItems,
      },
      {
        label: CATEGORY_LABELS.actions,
        items: actionItems,
      },
    ];
  }, [navItems, pagesItems, actionItems]);

  return categories;
}

// ── Component ──────────────────────────────────────────────────────

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  onSelect: (item: CommandPaletteItemData) => void;
}

/**
 * ⌘K Command Palette modal — inspired by Linear, Raycast, VS Code.
 *
 * Fixed overlay with backdrop blur, search input, and categorized
 * results.  Keyboard navigation with ↑↓ arrows, Enter to select,
 * Escape to close.
 */
export function CommandPalette({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  selectedIndex,
  onIndexChange,
  onSelect,
}: CommandPaletteProps): React.ReactElement | null {
  const { data: pages, isLoading: pagesLoading } = usePages();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build all visible items (flat list with category headers)
  const allItems = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const filter = (items: CommandPaletteItemData[]): CommandPaletteItemData[] =>
      !query
        ? items
        : items.filter(
            (item) =>
              item.title.toLowerCase().includes(query) ||
              (item.subtitle ?? "").toLowerCase().includes(query),
          );

    const navItems = filter(
      STATIC_NAV_ITEMS.map((item) => ({
        ...item,
        id: staticItemId("navigation", item.title),
      })),
    );
    const pagesItems = filter(
      (pages ?? pagesLoading ? [] : pages).map((p) => ({
        id: pageItemId(p.path),
        title: p.title,
        subtitle: p.path,
        icon: "FileText",
      })),
    );
    const actionItems = filter(
      STATIC_ACTION_ITEMS.map((item) => ({
        ...item,
        id: staticItemId("actions", item.title),
      })),
    );

    return {
      navigation: navItems,
      pages: pagesItems,
      actions: actionItems,
    };
  }, [searchQuery, pages, pagesLoading]);

  // Flatten to indexed list (only non-empty categories)
  const flatItems = useMemo<CommandPaletteItemData[]>(() => {
    const result: CommandPaletteItemData[] = [];
    if (allItems.navigation.length)
      result.push(...allItems.navigation);
    if (allItems.pages.length)
      result.push(...allItems.pages);
    if (allItems.actions.length)
      result.push(...allItems.actions);
    return result;
  }, [allItems]);

  const totalResults = flatItems.length;

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      selectedEl?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          onIndexChange(
            (selectedIndex + 1) % (totalResults > 0 ? totalResults : 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          onIndexChange(
            (selectedIndex - 1 + (totalResults > 0 ? totalResults : 1)) %
              (totalResults > 0 ? totalResults : 1),
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < totalResults) {
            onSelect(flatItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [
      selectedIndex,
      totalResults,
      flatItems,
      onIndexChange,
      onSelect,
      onClose,
    ],
  );

  // Handle item selection
  const handleSelect = useCallback(
    (item: CommandPaletteItemData) => {
      onSelect(item);
    },
    [onSelect],
  );

  // Render nothing when closed
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-500 animate-[fadeIn_0.5s_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        style={{
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <SearchIcon className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-gray-100 dark:placeholder-gray-500"
            aria-label="Search commands"
          />
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2"
          role="listbox"
          aria-label="Command results"
        >
          {totalResults === 0 ? (
            <div className="flex flex-col items-center py-10 text-gray-400 dark:text-gray-500">
              <SearchIcon className="mb-2 h-6 w-6 opacity-50" />
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <>
              {/* Navigation section */}
              {allItems.navigation.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {CATEGORY_LABELS.navigation}
                  </p>
                  {allItems.navigation.map((item, idx) => (
                    <CommandPaletteItem
                      key={item.id}
                      data={item}
                      isSelected={
                        idx === selectedIndex ||
                        (allItems.navigation.length + allItems.pages.length > 0 &&
                          idx + allItems.pages.length + allItems.navigation.length ===
                            selectedIndex + 1)
                      }
                      searchQuery={searchQuery}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}

              {/* Pages section */}
              {allItems.pages.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {CATEGORY_LABELS.pages}
                  </p>
                  {allItems.pages.map((item, idx) => {
                    const navCount = allItems.navigation.length;
                    const actualIndex = navCount + idx;
                    return (
                      <CommandPaletteItem
                        key={item.id}
                        data={item}
                        isSelected={actualIndex === selectedIndex}
                        searchQuery={searchQuery}
                        onSelect={handleSelect}
                      />
                    );
                  })}
                </div>
              )}

              {/* Actions section */}
              {allItems.actions.length > 0 && (
                <div>
                  <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {CATEGORY_LABELS.actions}
                  </p>
                  {allItems.actions.map((item, idx) => {
                    const navCount = allItems.navigation.length;
                    const pageCount = allItems.pages.length;
                    const actualIndex = navCount + pageCount + idx;
                    return (
                      <CommandPaletteItem
                        key={item.id}
                        data={item}
                        isSelected={actualIndex === selectedIndex}
                        searchQuery={searchQuery}
                        onSelect={handleSelect}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Keyboard hints */}
        <div className="flex items-center gap-3 border-t border-gray-200 px-4 py-2 text-[11px] text-gray-400 dark:border-gray-700 dark:text-gray-500">
          <span>
            <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-gray-800">
              ↑↓
            </kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-gray-800">
              ↵
            </kbd>{" "}
            select
          </span>
          <span>
            <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px] dark:bg-gray-800">
              esc
            </kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}
