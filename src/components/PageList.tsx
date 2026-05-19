import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { PageListItem } from './PageListItem';
import { Skeleton } from './Skeleton';
import type { WikiPage, SortOption, SortDirection } from '../types/wiki';

interface PageListProps {
  pages?: WikiPage[];
  loading?: boolean;
  error?: string | null;
  onNavigate?: (slug: string) => void;
  onCreatePage?: () => void;
}

const SORT_LABELS: Record<SortOption, string> = {
  name: 'Name',
  modified: 'Date Modified',
  viewed: 'Recently Viewed',
};

/**
 * Page list component with sorting, filtering, loading, empty, and error states.
 */
export function PageList({
  pages = [],
  loading = false,
  error = null,
  onNavigate,
  onCreatePage,
}: PageListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('modified');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Sort + filter
  const filteredAndSorted = useMemo(() => {
    let result = [...pages];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.path.toLowerCase().includes(q) ||
          (p.snippet && p.snippet.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortOption) {
        case 'name':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'modified':
          cmp =
            new Date(a.modified).getTime() - new Date(b.modified).getTime();
          break;
        case 'viewed':
          cmp =
            (new Date(a.lastViewed ?? 0).getTime() ?? 0) -
            (new Date(b.lastViewed ?? 0).getTime() ?? 0);
          break;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [pages, searchQuery, sortOption, sortDirection]);

  const handleToggleSortDirection = useCallback(() => {
    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
  }, []);

  const handleNavigate = useCallback(
    (slug: string) => {
      if (onNavigate) {
        onNavigate(slug);
      }
    },
    [onNavigate]
  );

  const handleEdit = useCallback(
    (slug: string) => {
      if (onNavigate) {
        onNavigate(`/pages/${slug}/edit`);
      }
    },
    [onNavigate]
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="list" className="h-20" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-900">
        <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Failed to load pages
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {error}
        </p>
        <button
          onClick={() => {
            // Intentionally not reloading — caller manages this
          }}
          className="mt-4 flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-600 dark:bg-gray-900">
        <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
          <FileText className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No pages yet
        </p>
        <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
          Create your first page to get started.
        </p>
        <button
          onClick={onCreatePage}
          className="mt-4 flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Create First Page
        </button>
      </div>
    );
  }

  // Page list with controls
  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900"
          />
        </div>

        {/* Sort + Create */}
        <div className="flex items-center gap-2">
          {/* Sort controls */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((s) => !s)}
              className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {SORT_LABELS[sortOption]}
              </span>
              {sortDirection === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
            </button>

            {/* Dropdown */}
            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortOption(key);
                        setShowSortMenu(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 ${
                        sortOption === key
                          ? 'font-semibold text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{SORT_LABELS[key]}</span>
                      {sortOption === key && (
                        <span className="text-indigo-500">●</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-700" />
                  <button
                    onClick={handleToggleSortDirection}
                    className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    {sortDirection === 'asc' ? (
                      <>
                        <ArrowUp className="h-3 w-3" />
                        Sort A → Z / Oldest first
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-3 w-3" />
                        Sort Z → A / Newest first
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Create button */}
          <button
            onClick={onCreatePage}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Page</span>
          </button>
        </div>
      </div>

      {/* Filtered result count */}
      {searchQuery && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {filteredAndSorted.length} result
          {filteredAndSorted.length !== 1 ? 's' : ''} for "
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {searchQuery}
          </span>
          "
        </p>
      )}

      {/* Page items */}
      {filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
          <Search className="mb-2 h-6 w-6 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No pages match your search
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSorted.map((page) => (
            <PageListItem
              key={page.id}
              title={page.title}
              path={page.path}
              modified={page.modified}
              snippet={page.snippet}
              onClick={() => handleNavigate(`/pages/${page.slug}`)}
              onEdit={() => handleEdit(page.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
