import { useState, useMemo } from 'react';
import { useAssets } from '../hooks/useApiQuery';
import {
  Image,
  FileText,
  Music,
  Film,
  File,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { formatFileSize, formatDate, type AssetType } from '../types/asset';

const typeIcons: Record<string, typeof Image> = {
  image: Image,
  document: FileText,
  audio: Music,
  video: Film,
  other: File,
};

type FilterType = 'all' | 'Ready' | 'Processing' | 'Queued';

export default function AssetsPage() {
  const { data: assets, isLoading } = useAssets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<'name' | 'date'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const arr = assets ?? [];
    let result = arr;
    if (filter !== 'all') result = result.filter((a) => a.status === filter);
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.filename.localeCompare(b.filename);
      else cmp = new Date(a.modified || a.id).getTime() - new Date(b.modified || b.id).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [assets, filter, sortField, sortDir]);

  const toggleSort = (field: 'name' | 'date') => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assets</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} asset{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {(['all', 'Ready', 'Processing', 'Queued'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((asset) => {
          const Icon = typeIcons[asset.type] || File;
          return (
            <div
              key={asset.id}
              className="group p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
            >
              <div className="w-full h-24 rounded-lg bg-gray-100 dark:bg-gray-800 mb-3 flex items-center justify-center">
                <Icon className="w-8 h-8 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <p className="text-sm font-medium truncate">{asset.filename}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatFileSize(0)}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    asset.status === 'Ready'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : asset.status === 'Processing'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}
                >
                  {asset.status}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-600">
            No assets match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
