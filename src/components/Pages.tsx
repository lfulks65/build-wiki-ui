import { useState, useMemo } from 'react';
import { usePages } from '../hooks/useApiQuery';
import { useRelativeTime } from '../hooks/useRelativeTime';
import { FileText, Clock, ChevronDown } from 'lucide-react';
import type { SortOption, SortDirection } from '../types/wiki';

type SortConfig = { key: SortOption; dir: SortDirection };

export default function Pages() {
  const { data: pages, isLoading } = usePages();
  const [sort, setSort] = useState<SortConfig>({
    key: 'modified',
    dir: 'desc',
  });

  const sorted = useMemo(() => {
    const arr = pages ?? [];
    return [...arr].sort((a, b) => {
      let cmp = 0;
      if (sort.key === 'name') cmp = a.title.localeCompare(b.title);
      else {
        cmp = new Date(b.modified).getTime() - new Date(a.modified).getTime();
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [pages, sort]);

  const toggleSort = (key: SortOption) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Pages</h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pages</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sorted.length} page{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Sort header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => toggleSort('name')}
            className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <FileText className="w-3.5 h-3.5" />
            Name
            {sort.key === 'name' && (
              <ChevronDown className={`w-3 h-3 transition-transform ${sort.dir === 'asc' ? 'rotate-180' : ''}`} />
            )}
          </button>
          <button
            onClick={() => toggleSort('modified')}
            className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <Clock className="w-3.5 h-3.5" />
            Modified
            {sort.key === 'modified' && (
              <ChevronDown className={`w-3 h-3 transition-transform ${sort.dir === 'asc' ? 'rotate-180' : ''}`} />
            )}
          </button>
          <span className="flex-1" />
          <span className="text-gray-400 dark:text-gray-600">Path</span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {sorted.map((page) => {
            const relative = useRelativeTime(page.modified);
            return (
              <div
                key={page.path}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{page.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {page.path}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {relative}
                </span>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="px-4 py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
              No pages found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
